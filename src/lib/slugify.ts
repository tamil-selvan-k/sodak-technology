export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Generates a unique slug by appending -2, -3 … when the base slug is taken.
 * Pass a `checker` that returns true if the candidate slug is already in use.
 * Optionally pass `excludeId` to skip the current record when checking updates.
 */
export async function makeUniqueSlug(
  baseInput: string,
  checker: (candidate: string) => Promise<boolean>,
): Promise<string> {
  const base = slugify(baseInput)
  let candidate = base
  let suffix = 2
  while (suffix <= 99) {
    if (!(await checker(candidate))) return candidate
    candidate = `${base}-${suffix}`
    suffix++
  }
  return `${base}-${Date.now()}`
}
