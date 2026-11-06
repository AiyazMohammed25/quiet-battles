import {
  createHash,
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "qb_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

// Read admin secrets and make sure they meet the minimum length rules.
function configuredSecrets() {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!password || password.length < 12 || !secret || secret.length < 32) {
    return null;
  }
  return { password, secret };
}

// Compare secrets without revealing how many characters match.
function safeEqual(left: string, right: string) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

// Create a signature that proves the session payload was not changed.
function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

// Create a signed session token that expires after the session duration.
function createSessionToken(secret: string) {
  const payload = Buffer.from(
    JSON.stringify({
      expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000,
    }),
  ).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

// Check the cookie signature and expiry before allowing admin access.
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

// Tell the login page whether the required admin settings exist.
export function isAdminConfigured() {
  return configuredSecrets() !== null;
}

// Check whether this request has a valid admin session.
export function isAdminAuthenticated(request: NextRequest) {
  const secrets = configuredSecrets();
  return secrets ? hasValidSession(request, secrets.secret) : false;
}

// Reject write requests that did not come from this site.
export function requireSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  return null;
}

// Build the standard response used when a request has no valid session.
export function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Sign in to manage content." },
    { status: 401 },
  );
}

// Check the password and set a signed, HTTP-only session cookie.
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

// Remove the session cookie so the admin is signed out.
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
