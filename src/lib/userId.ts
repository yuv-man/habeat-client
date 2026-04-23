import type { IUser } from "@/types/interfaces";

/**
 * Stable Mongo user id string for URLs and API paths.
 * Handles `_id`, string `id`, and rejects literal "undefined"/"null" from bad templates.
 */
export function resolveUserDocumentId(
  user: Partial<IUser> | null | undefined
): string | undefined {
  if (!user) return undefined;
  const raw =
    user._id ??
    (user as unknown as { id?: string }).id ??
    (user as unknown as { userId?: string }).userId;
  if (raw == null) return undefined;
  const s = String(raw).trim();
  if (!s || s === "undefined" || s === "null") return undefined;
  return s;
}
