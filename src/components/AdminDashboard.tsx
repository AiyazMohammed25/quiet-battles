"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  BookOpen,
  Layers,
  LogOut,
  Package,
  Pencil,
  Plus,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import type {
  ChapterContent,
  ContentStatus,
  ProductContent,
  SeriesContent,
} from "@/types/content";

type Collection = "series" | "chapters" | "products";
type Entry = SeriesContent | ChapterContent | ProductContent;
interface AdminContent {
  series: SeriesContent[];
  chapters: ChapterContent[];
  products: ProductContent[];
}
type Draft = Record<string, string>;

const EMPTY_CONTENT: AdminContent = {
  series: [],
  chapters: [],
  products: [],
};

const EMPTY_DRAFT: Draft = {
  title: "",
  slug: "",
  description: "",
  releaseYear: "2026",
  coverImage: "",
  seriesId: "",
  chapterNumber: "1",
  storyContent: "",
  imageUrl: "",
  productId: "",
  name: "",
  price: "",
  sizes: "S, M, L, XL, XXL",
  images: "",
  stockStatus: "In stock",
  status: "Published",
};

const collectionInfo: Record<
  Collection,
  { label: string; singular: string; icon: typeof Layers }
> = {
  series: { label: "Series", singular: "series", icon: Layers },
  chapters: { label: "Chapters", singular: "chapter", icon: BookOpen },
  products: { label: "Products", singular: "product", icon: Package },
};

// Check whether an API response is a plain object before reading its fields.
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Turn a name into a URL-friendly slug for Series and Products.
function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Send an admin API request and return its data or a readable error.
async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const body: unknown = await response.json();

  if (!isRecord(body)) throw new Error("The server returned an invalid response.");
  if (!response.ok) {
    throw new Error(
      typeof body.error === "string" ? body.error : "The request failed.",
    );
  }
  if (!("data" in body)) return body as T;
  return body.data as T;
}

// Pick the correct display name for the selected type of record.
function displayName(entry: Entry, collection: Collection) {
  if (collection === "series") return (entry as SeriesContent).title;
  if (collection === "chapters") return (entry as ChapterContent).title;
  return (entry as ProductContent).name;
}

// Fill the editor form with an existing record, or return a blank form.
function makeDraft(entry?: Entry, collection?: Collection): Draft {
  if (!entry || !collection) return { ...EMPTY_DRAFT };

  if (collection === "series") {
    const series = entry as SeriesContent;
    return {
      ...EMPTY_DRAFT,
      title: series.title,
      slug: series.slug,
      description: series.description,
      releaseYear: String(series.releaseYear),
      coverImage: series.coverImage,
      status: series.status,
    };
  }

  if (collection === "chapters") {
    const chapter = entry as ChapterContent;
    return {
      ...EMPTY_DRAFT,
      seriesId: chapter.seriesId,
      chapterNumber: String(chapter.chapterNumber),
      title: chapter.title,
      storyContent: chapter.storyContent,
      imageUrl: chapter.imageUrl,
      productId: chapter.productId ?? "",
      status: chapter.status,
    };
  }

  const product = entry as ProductContent;
  return {
    ...EMPTY_DRAFT,
    name: product.name,
    slug: product.slug,
    price: String(product.price),
    description: product.description,
    sizes: product.sizes.join(", "),
    images: product.images.join("\n"),
    stockStatus: product.stockStatus,
    status: product.status,
  };
}

// Choose the next unused chapter number for the selected series.
function nextChapterNumber(seriesId: string, chapters: ChapterContent[]) {
  const chapterNumbers = chapters
    .filter((chapter) => chapter.seriesId === seriesId)
    .map((chapter) => chapter.chapterNumber);
  return Math.max(0, ...chapterNumbers) + 1;
}

// Convert the form values into the API fields for the selected collection.
function buildPayload(collection: Collection, draft: Draft) {
  const status = draft.status as ContentStatus;
  if (collection === "series") {
    return {
      title: draft.title,
      slug: draft.slug,
      description: draft.description,
      releaseYear: Number(draft.releaseYear),
      coverImage: draft.coverImage,
      status,
    };
  }
  if (collection === "chapters") {
    return {
      seriesId: draft.seriesId,
      chapterNumber: Number(draft.chapterNumber),
      title: draft.title,
      storyContent: draft.storyContent,
      imageUrl: draft.imageUrl,
      productId: draft.productId || null,
      status,
    };
  }
  return {
    name: draft.name,
    slug: draft.slug,
    price: Number(draft.price),
    description: draft.description,
    sizes: draft.sizes.split(",").map((size) => size.trim()).filter(Boolean),
    images: draft.images.split("\n").map((image) => image.trim()).filter(Boolean),
    stockStatus: draft.stockStatus,
    status,
  };
}

// Run admin sign-in and show forms for managing Series, Chapters, and Products.
export default function AdminDashboard() {
  const [activeCollection, setActiveCollection] =
    useState<Collection>("series");
  // MongoDB is the source of truth; refresh these lists after sign-in and every successful write.
  const [content, setContent] = useState<AdminContent>(EMPTY_CONTENT);
  const [draft, setDraft] = useState<Draft>({ ...EMPTY_DRAFT });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Entry | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Reload all collections so the dashboard shows the latest database records.
  const loadContent = async () => {
    const [series, chapters, products] = await Promise.all([
      apiRequest<SeriesContent[]>("/api/admin/series"),
      apiRequest<ChapterContent[]>("/api/admin/chapters"),
      apiRequest<ProductContent[]>("/api/admin/products"),
    ]);
    setContent({ series, chapters, products });
  };

  useEffect(() => {
    let active = true;

    // Check whether a saved session exists when the dashboard first opens.
    const checkSession = async () => {
      try {
        const session = await apiRequest<{
          authenticated: boolean;
          configured: boolean;
        }>("/api/admin/auth");
        if (!active) return;
        setConfigured(session.configured);
        setAuthenticated(session.authenticated);
        if (session.authenticated) await loadContent();
      } catch (requestError) {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Could not check the admin session.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void checkSession();
    return () => {
      active = false;
    };
  }, []);

  // Send the password to the server and load records after a successful login.
  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await apiRequest("/api/admin/auth", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      setPassword("");
      setAuthenticated(true);
      await loadContent();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not sign in.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Sign out and clear the records from the page.
  const handleLogout = async () => {
    setError("");
    try {
      await apiRequest("/api/admin/auth", { method: "DELETE" });
      setAuthenticated(false);
      setContent(EMPTY_CONTENT);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not sign out.",
      );
    }
  };

  // Reset the editor and open a blank form for a new record.
  const openCreate = () => {
    setEditingId(null);
    setDraft({
      ...EMPTY_DRAFT,
      seriesId:
        activeCollection === "chapters" ? (content.series[0]?.id ?? "") : "",
      chapterNumber:
        activeCollection === "chapters" && content.series[0]
          ? String(nextChapterNumber(content.series[0].id, content.chapters))
          : EMPTY_DRAFT.chapterNumber,
    });
    setError("");
    setNotice("");
    setEditorOpen(true);
  };

  // Copy the selected record into the editor form.
  const openEdit = (entry: Entry) => {
    setEditingId(entry.id);
    setDraft(makeDraft(entry, activeCollection));
    setError("");
    setNotice("");
    setEditorOpen(true);
  };

  // Update one form value and keep generated slugs in sync with names.
  const changeField = (field: string, value: string) => {
    setDraft((current) => {
      const next = { ...current, [field]: value };
      if (activeCollection === "chapters" && field === "seriesId") {
        next.chapterNumber = String(nextChapterNumber(value, content.chapters));
      }
      if (activeCollection === "series" && field === "title") {
        const oldSlug = slugify(current.title);
        if (!current.slug || current.slug === oldSlug) {
          next.slug = slugify(value);
        }
      }
      if (activeCollection === "products" && field === "name") {
        const oldSlug = slugify(current.name);
        if (!current.slug || current.slug === oldSlug) {
          next.slug = slugify(value);
        }
      }
      return next;
    });
  };

  // Create or update the record, then reload the saved database data.
  const saveEntry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const method = editingId ? "PATCH" : "POST";
      const url = editingId
        ? `/api/admin/${activeCollection}/${encodeURIComponent(editingId)}`
        : `/api/admin/${activeCollection}`;
      await apiRequest(url, {
        method,
        body: JSON.stringify(buildPayload(activeCollection, draft)),
      });
      await loadContent();
      setNotice(
        `${collectionInfo[activeCollection].singular} ${
          editingId ? "updated" : "created"
        } in MongoDB.`,
      );
      setEditorOpen(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not save this entry.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete the selected record after the admin confirms the action.
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setError("");
    setSaving(true);
    try {
      await apiRequest(
        `/api/admin/${activeCollection}/${encodeURIComponent(deleteTarget.id)}`,
        { method: "DELETE" },
      );
      await loadContent();
      setNotice(`${displayName(deleteTarget, activeCollection)} was deleted.`);
      setDeleteTarget(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not delete this entry.",
      );
      setDeleteTarget(null);
    } finally {
      setSaving(false);
    }
  };

  const entries = content[activeCollection];
  const currentLabel = collectionInfo[activeCollection];

  if (loading) {
    return (
      <p className="px-6 py-24 text-center text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        Connecting to the studio…
      </p>
    );
  }

  if (!configured) {
    return (
      <div className="mx-auto max-w-xl px-5 py-20">
        <h1 className="text-2xl font-medium uppercase">Configure admin access</h1>
        <p className="mt-4 text-sm leading-7 text-zinc-400">
          Set <code>ADMIN_PASSWORD</code> (at least 12 characters) and{" "}
          <code>ADMIN_SESSION_SECRET</code> (at least 32 characters) in your
          private <code>.env</code> file, then restart the app.
        </p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 sm:py-28">
        <p className="text-[9px] uppercase tracking-[0.24em] text-zinc-500">
          Quiet Battles™ / Secure area
        </p>
        <h1 className="mt-4 text-3xl font-medium uppercase tracking-[-0.04em]">
          Content studio
        </h1>
        <p className="mt-3 text-xs leading-6 text-zinc-500">
          Sign in to manage series, chapters, and products.
        </p>
        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <label className="block space-y-2">
            <span className="text-[9px] uppercase tracking-[0.16em] text-zinc-400">
              Admin password
            </span>
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-h-12 w-full border border-white/15 bg-black/30 px-3 text-sm outline-none focus:border-white/50"
            />
          </label>
          {error && (
            <p role="alert" className="text-xs leading-5 text-red-300">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="min-h-12 w-full bg-white px-5 text-[9px] font-semibold uppercase tracking-[0.18em] text-black disabled:opacity-50"
          >
            {saving ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-8 md:py-14 lg:px-12">
      <header className="flex flex-col justify-between gap-6 border-b border-white/10 pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="text-[9px] uppercase tracking-[0.25em] text-zinc-500">
            Quiet Battles™ / Studio
          </p>
          <h1 className="mt-3 text-3xl font-medium uppercase tracking-[-0.05em] sm:text-4xl">
            Content studio
          </h1>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex min-h-10 items-center gap-2 self-start text-[9px] uppercase tracking-[0.16em] text-zinc-500 transition hover:text-white sm:self-auto"
        >
          <LogOut size={14} /> Sign out
        </button>
      </header>

      <div className="mt-6 flex gap-2 overflow-x-auto border-b border-white/10 pb-3">
        {(Object.keys(collectionInfo) as Collection[]).map((collection) => {
          const Icon = collectionInfo[collection].icon;
          const selected = activeCollection === collection;
          return (
            <button
              key={collection}
              type="button"
              onClick={() => {
                setActiveCollection(collection);
                setNotice("");
                setError("");
              }}
              aria-pressed={selected}
              className={`inline-flex shrink-0 items-center gap-2 px-4 py-3 text-[9px] uppercase tracking-[0.16em] transition ${
                selected
                  ? "bg-white text-black"
                  : "text-zinc-500 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={14} />
              {collectionInfo[collection].label}
              <span className={selected ? "text-black/60" : "text-zinc-600"}>
                {content[collection].length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-[0.15em]">
            {currentLabel.label}
          </h2>
          <p className="mt-1 text-[10px] text-zinc-500">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex min-h-11 items-center gap-2 bg-white px-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-zinc-200"
        >
          <Plus size={14} /> Add {currentLabel.singular}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-5 border border-red-300/20 bg-red-300/[0.04] px-4 py-3 text-xs text-red-200"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="mt-5 border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-zinc-300"
        >
          {notice}
        </p>
      )}

      <div className="mt-5 divide-y divide-white/10 border-y border-white/10">
        {entries.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">
              No {currentLabel.label.toLowerCase()} yet
            </p>
            <p className="mt-2 text-xs text-zinc-600">
              Add your first {currentLabel.singular} or run the starter seed
              command.
            </p>
          </div>
        ) : (
          entries.map((entry) => (
            <article
              key={entry.id}
              className="flex flex-col justify-between gap-5 py-5 sm:flex-row sm:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-sm font-medium">
                    {displayName(entry, activeCollection)}
                  </h3>
                  <span className="text-[8px] uppercase tracking-[0.16em] text-zinc-400">
                    {entry.status}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 max-w-3xl text-xs leading-5 text-zinc-500">
                  {"description" in entry
                    ? entry.description
                    : entry.storyContent}
                </p>
                <p className="mt-2 text-[9px] uppercase tracking-[0.12em] text-zinc-600">
                  {"slug" in entry
                    ? entry.slug
                    : `Chapter ${entry.chapterNumber}`}
                  {"price" in entry &&
                    ` · ₹${entry.price.toLocaleString("en-IN")} · ${entry.stockStatus}`}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(entry)}
                  aria-label={`Edit ${displayName(entry, activeCollection)}`}
                  className="flex h-10 w-10 items-center justify-center border border-white/10 text-zinc-400 transition hover:border-white/40 hover:text-white"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTarget(entry);
                    setError("");
                  }}
                  aria-label={`Delete ${displayName(entry, activeCollection)}`}
                  className="flex h-10 w-10 items-center justify-center border border-white/10 text-zinc-500 transition hover:border-red-400/50 hover:text-red-300"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="mt-8 flex gap-3 border border-amber-200/15 bg-amber-100/[0.03] p-4">
        <ShieldAlert size={16} className="mt-0.5 shrink-0 text-amber-100/60" />
        <p className="text-[10px] leading-5 text-zinc-500">
          <span className="text-zinc-300">Server-protected CMS.</span> Writes
          require the configured admin password and a signed, HTTP-only
          same-site session cookie.
        </p>
      </div>

      {editorOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="editor-title"
            className="my-auto w-full max-w-xl border border-white/15 bg-[#111] p-5 shadow-2xl sm:p-7"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                  {editingId ? "Update database record" : "New database record"}
                </p>
                <h2
                  id="editor-title"
                  className="mt-2 text-xl font-medium uppercase tracking-[-0.03em]"
                >
                  {editingId ? "Edit" : "Add"} {currentLabel.singular}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close form"
                onClick={() => setEditorOpen(false)}
                className="flex h-9 w-9 items-center justify-center text-zinc-500 hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={saveEntry} className="space-y-4">
              {activeCollection === "series" && (
                <>
                  <TextField
                    label="Title"
                    value={draft.title}
                    maxLength={120}
                    onChange={(value) => changeField("title", value)}
                  />
                  <TextField
                    label="URL slug"
                    value={draft.slug}
                    maxLength={120}
                    onChange={(value) => changeField("slug", value)}
                  />
                  <NumberField
                    label="Release year"
                    value={draft.releaseYear}
                    min={1900}
                    max={2200}
                    onChange={(value) => changeField("releaseYear", value)}
                  />
                  <TextField
                    label="Cover image URL"
                    value={draft.coverImage}
                    maxLength={2048}
                    onChange={(value) => changeField("coverImage", value)}
                  />
                  <TextAreaField
                    label="Description"
                    value={draft.description}
                    maxLength={2000}
                    onChange={(value) => changeField("description", value)}
                  />
                </>
              )}

              {activeCollection === "chapters" && (
                <>
                  <SelectField
                    label="Series"
                    value={draft.seriesId}
                    onChange={(value) => changeField("seriesId", value)}
                    options={content.series.map((series) => ({
                      value: series.id,
                      label: series.title,
                    }))}
                  />
                  <NumberField
                    label="Chapter number"
                    value={draft.chapterNumber}
                    min={1}
                    max={999}
                    onChange={(value) => changeField("chapterNumber", value)}
                  />
                  <TextField
                    label="Title"
                    value={draft.title}
                    maxLength={120}
                    onChange={(value) => changeField("title", value)}
                  />
                  <TextField
                    label="Image URL"
                    value={draft.imageUrl}
                    maxLength={2048}
                    onChange={(value) => changeField("imageUrl", value)}
                  />
                  <SelectField
                    label="Linked product (optional)"
                    value={draft.productId}
                    onChange={(value) => changeField("productId", value)}
                    options={content.products.map((product) => ({
                      value: product.id,
                      label: product.name,
                    }))}
                    allowEmpty
                  />
                  <TextAreaField
                    label="Story content"
                    value={draft.storyContent}
                    maxLength={12000}
                    onChange={(value) => changeField("storyContent", value)}
                  />
                </>
              )}

              {activeCollection === "products" && (
                <>
                  <TextField
                    label="Product name"
                    value={draft.name}
                    maxLength={120}
                    onChange={(value) => changeField("name", value)}
                  />
                  <TextField
                    label="URL slug"
                    value={draft.slug}
                    maxLength={120}
                    onChange={(value) => changeField("slug", value)}
                  />
                  <NumberField
                    label="Price (₹)"
                    value={draft.price}
                    min={1}
                    max={1000000}
                    onChange={(value) => changeField("price", value)}
                  />
                  <TextField
                    label="Sizes (comma-separated)"
                    value={draft.sizes}
                    maxLength={40}
                    onChange={(value) => changeField("sizes", value)}
                  />
                  <SelectField
                    label="Stock status"
                    value={draft.stockStatus}
                    onChange={(value) => changeField("stockStatus", value)}
                    options={[
                      { value: "In stock", label: "In stock" },
                      { value: "Out of stock", label: "Out of stock" },
                      { value: "Pre-order", label: "Pre-order" },
                    ]}
                  />
                  <TextAreaField
                    label="Image URLs (one per line)"
                    value={draft.images}
                    maxLength={12000}
                    required={false}
                    onChange={(value) => changeField("images", value)}
                  />
                  <TextAreaField
                    label="Description"
                    value={draft.description}
                    maxLength={2000}
                    onChange={(value) => changeField("description", value)}
                  />
                </>
              )}

              <SelectField
                label="Publication status"
                value={draft.status}
                onChange={(value) => changeField("status", value)}
                options={[
                  { value: "Published", label: "Published" },
                  { value: "Draft", label: "Draft" },
                ]}
              />

              {error && (
                <p role="alert" className="text-xs leading-5 text-red-300">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="min-h-11 px-4 text-[9px] uppercase tracking-[0.16em] text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-11 bg-white px-5 text-[9px] font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-zinc-200 disabled:opacity-50"
                >
                  {saving
                    ? "Saving…"
                    : editingId
                      ? "Save changes"
                      : "Create entry"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="w-full max-w-md border border-white/15 bg-[#111] p-6"
          >
            <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500">
              Confirm removal
            </p>
            <h2
              id="delete-title"
              className="mt-3 text-lg font-medium uppercase tracking-[-0.02em]"
            >
              Delete this {currentLabel.singular}?
            </h2>
            <p className="mt-3 text-xs leading-6 text-zinc-400">
              “{displayName(deleteTarget, activeCollection)}” will be
              permanently deleted. A series with chapters must be emptied
              before it can be deleted.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="min-h-10 px-4 text-[9px] uppercase tracking-[0.16em] text-zinc-400 hover:text-white"
              >
                Keep entry
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void confirmDelete()}
                className="min-h-10 bg-red-200 px-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-red-100 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

// Show a reusable single-line text input in the editor form.
function TextField({
  label,
  value,
  maxLength,
  onChange,
}: {
  label: string;
  value: string;
  maxLength: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[9px] uppercase tracking-[0.16em] text-zinc-400">
        {label}
      </span>
      <input
        required={label !== "Cover image URL" && label !== "Image URL"}
        maxLength={maxLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full border border-white/15 bg-black/30 px-3 text-sm outline-none transition focus:border-white/50"
      />
    </label>
  );
}

// Show a reusable whole-number input in the editor form.
function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[9px] uppercase tracking-[0.16em] text-zinc-400">
        {label}
      </span>
      <input
        required
        type="number"
        min={min}
        max={max}
        step="1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full border border-white/15 bg-black/30 px-3 text-sm outline-none transition focus:border-white/50"
      />
    </label>
  );
}

// Show a reusable multi-line text input in the editor form.
function TextAreaField({
  label,
  value,
  maxLength,
  required = true,
  onChange,
}: {
  label: string;
  value: string;
  maxLength: number;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[9px] uppercase tracking-[0.16em] text-zinc-400">
        {label}
      </span>
      <textarea
        required={required}
        maxLength={maxLength}
        rows={3}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-y border border-white/15 bg-black/30 px-3 py-3 text-sm leading-6 outline-none transition focus:border-white/50"
      />
    </label>
  );
}

// Show a reusable dropdown for choosing a linked record or status.
function SelectField({
  label,
  value,
  onChange,
  options,
  allowEmpty = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  allowEmpty?: boolean;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[9px] uppercase tracking-[0.16em] text-zinc-400">
        {label}
      </span>
      <select
        required={!allowEmpty}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full border border-white/15 bg-[#151515] px-3 text-sm outline-none transition focus:border-white/50"
      >
        {allowEmpty && <option value="">None</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
