/**
 * Returns a specified default message if the optional one isn't provided.
 */
export function withDefaultMessage(defaultMessage: string, provided?: string) {
  return provided || defaultMessage
}