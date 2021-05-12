import { ValidationFunction } from './validators';

/**
 * Negates the context. The result of passed validators will be flipped such that
 * the inverse of the provided validators will pass.
 */
export function not<T>(...validators: ValidationFunction<T>[]): ValidationFunction<T> {
  return (candidate) => validators
    .map(v => v(candidate))
    .map(x => !x)
    .every(x => x === true)
}

/**
 * Maps a value, permitting you to perform validation operations on the mapped value
 * within in the calling context of this function.
 * 
 * @param map 
 * A mapping function
 */
export function andWhenMapped<T, U>(
  map: (t: T) => U,
  ...validators: ValidationFunction<U>[]
): ValidationFunction<T> {
  return (candidate) => {
    const mapped = map(candidate)

    return validators
      .map(v => v(mapped))
      .every(x => x === true)
  }
}