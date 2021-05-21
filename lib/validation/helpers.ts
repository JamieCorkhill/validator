/**
 * A wrapper for providing expressive error message functionality. 
 */
export type OtherwiseFunction = (message: string) => string

/**
 * A wrapper for providing expressive error message functionality. 
 */
export function otherwise(message: string) {
  return message
}