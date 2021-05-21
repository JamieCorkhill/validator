import { ValidationFunction } from './validators'
import { Input } from './../main'

/**
 * Lazily negates the context. The result of passed validators will be lazily flipped such that
 * the inverse of the provided validators will pass.
 */
export function not<T>(...validators: ValidationFunction<T>[]): ValidationFunction<T>[] {
  function negate(validator: ValidationFunction<T>): ValidationFunction<T> {
    return (candidate) => {
      const validationResult = validator(candidate)
      return {
        ...validationResult,
        satisfiesCondition: !validationResult.satisfiesCondition
      }
    }
  }

  return validators
    .map(negate)
}

/**
 * Maps a value, permitting you to perform validation operations on the mapped value
 * within the calling context of this function.
 * 
 * @param map 
 * A mapping function
 */
export function andWhenMapped<T, U>(
  mapCandidate: (t: T) => U,
  ...validators: Input<U>[]
): ValidationFunction<T>[] {
  function wrap(validator: ValidationFunction<U>): ValidationFunction<T> {
    return (candidate: T) => {
      const mapped = mapCandidate(candidate)
      return validator(mapped)
    }
  }

  return validators
    .map(v => Array.isArray(v) ? v.map(wrap) : wrap(v))
    .flat()
}

