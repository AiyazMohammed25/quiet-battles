import {
  createHash,
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "qb_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

// Keep sessions stateless: the browser stores only an expiring HMAC-signed payload, never the password.
function configuredSecrets() {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!password || password.length < 12 || !secret || secret.length < 32) {
    return null;
  }
  return { password, secret };
}

function safeEqual(left: string, right: string) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function createSessionToken(secret: string) {
  const payload = Buffer.from(
    JSON.stringify({
      expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000,
    }),
  ).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

function hasValidSession(request: NextRequest, secret: string) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;

  const separator = token.indexOf(".");
  if (separator <= 0 || separator === token.length - 1) return false;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  if (!safeEqual(signature, sign(payload, secret))) return false;

  try {
    const decoded: unknown = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    if (
      typeof decoded !== "object" ||
      decoded === null ||
      !("expiresAt" in decoded) ||
      typeof decoded.expiresAt !== "number"
    ) {
      return false;
    }
    return decoded.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export function isAdminConfigured() {
  return configuredSecrets() !== null;
}

export function isAdminAuthenticated(request: NextRequest) {
  const secrets = configuredSecrets();
  return secrets ? hasValidSession(request, secrets.secret) : false;
}

export function requireSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  return null;
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Sign in to manage content." },
    { status: 401 },
  );
}

export function createAdminSessionResponse(password: string) {
  const secrets = configuredSecrets();
  if (!secrets) {
    return NextResponse.json(
      {
        error:
          "Admin login is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET.",
      },
      { status: 503 },
    );
  }

  if (!safeEqual(password, secrets.password)) {
    return NextResponse.json(
      { error: "The password is incorrect." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(SESSION_COOKIE, createSessionToken(secrets.secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
  return response;
}

export function clearAdminSessionResponse() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
