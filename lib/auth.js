import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const COOKIE_NAME = "ps_token";

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export function setAuthCookie(token) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookie() {
  cookies().set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export function getUserFromRequest() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try { return jwt.verify(token, process.env.JWT_SECRET); } catch { return null; }
}

export function requireUser() {
  const u = getUserFromRequest();
  if (!u) { const err = new Error("Unauthorized"); err.status = 401; throw err; }
  return u;
}

export function requireAdmin() {
  const u = requireUser();
  if (u.role !== "admin") { const err = new Error("Forbidden"); err.status = 403; throw err; }
  return u;
}