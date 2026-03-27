import Cookies from "js-cookie";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

/**
 * MVP token helper:
 * - Keeps cookie operations in one place
 * - Emits a lightweight event so the app can react without polling
 *
 * NOTE: Cookies set from JS are not HttpOnly (XSS risk). For production, prefer
 * server-set HttpOnly cookies or another hardened approach.
 */
export function getAccessToken(): string | undefined {
  return Cookies.get(ACCESS_KEY);
}

export function setAuthTokens(tokens: { access: string; refresh?: string }) {
  Cookies.set(ACCESS_KEY, tokens.access, { expires: 7 });
  if (tokens.refresh) Cookies.set(REFRESH_KEY, tokens.refresh, { expires: 30 });
  window.dispatchEvent(new Event("auth:changed"));
}

export function clearAuthTokens() {
  Cookies.remove(ACCESS_KEY);
  Cookies.remove(REFRESH_KEY);
  window.dispatchEvent(new Event("auth:changed"));
}

