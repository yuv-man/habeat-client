/**
 * Coercions for data crossing the API boundary.
 *
 * Stores here assign response payloads straight into state — `challenges:
 * response.data.challenges`. When a payload arrives in a shape the client
 * didn't expect, that writes `undefined` into a field typed as an array, and
 * the first `.filter()` or `.length` downstream throws during render. Because
 * a throw during render unmounts the tree, a single unexpected response takes
 * out the whole screen.
 *
 * Degrading to an empty list instead is almost always the right trade: the
 * user sees a section with nothing in it rather than losing the page.
 */

/** The value if it is genuinely an array, otherwise an empty one. */
export function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/** The value if it is a usable object, otherwise null. */
export function asObject<T extends object>(value: unknown): T | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as T)
    : null;
}
