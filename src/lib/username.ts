/**
 * Pure client-safe username validation utility.
 * No server imports — safe to use in both client and server code.
 */

const RESERVED_USERNAMES = new Set([
  "admin",
  "root",
  "superuser",
  "administrator",
  "api",
  "www",
  "mail",
  "email",
  "support",
  "help",
  "info",
  "contact",
  "about",
  "home",
  "blog",
  "news",
  "feed",
  "explore",
  "search",
  "settings",
  "account",
  "login",
  "logout",
  "signup",
  "register",
  "profile",
  "user",
  "users",
  "instax",
  "moderator",
  "mod",
  "official",
  "null",
  "undefined",
  "me",
  "system",
]);

/** Returns null if valid, or an error message string if invalid. */
export function validateUsernameFormat(username: string): string | null {
  const trimmed = username.trim();

  if (trimmed.length < 3) return "Username must be at least 3 characters.";
  if (trimmed.length > 30) return "Username must be 30 characters or fewer.";
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed))
    return "Username can only contain letters, numbers, and underscores.";
  if (RESERVED_USERNAMES.has(trimmed.toLowerCase()))
    return `"${trimmed}" is a reserved username.`;

  return null;
}
