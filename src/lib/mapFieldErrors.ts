export function mapFieldErrors<T extends string>(
  keys: readonly T[],
  fieldErrors: Record<string, string[] | undefined>,
): Partial<Record<T, string>> {
  const errors: Partial<Record<T, string>> = {}

  for (const key of keys) {
    const messages = fieldErrors[key]
    if (messages?.[0]) {
      errors[key] = messages[0]
    }
  }

  return errors
}
