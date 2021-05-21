import { ValidatorFunction } from './validators'
import { ValidatorFunctions } from './../main'

/**
 * Lazily negates the context. The result of passed validators will be lazily flipped such that
 * the inverse of the provided validators will pass.
 */
export function not<T>(...validators: ValidatorFunction<T>[]): ValidatorFunction<T>[] {
  function negate(validator: ValidatorFunction<T>): ValidatorFunction<T> {
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
 * within the calling context of this function. Validator evaluation is lazy.
 * 
 * @param map 
 * A mapping function for the candidate
 */
export function whenMapped<T, U>(
  mapCandidate: (t: T) => U,
  ...validators: ValidatorFunctions<U>
): ValidatorFunction<T>[] {
  function wrap(validator: ValidatorFunction<U>): ValidatorFunction<T> {
    return (candidate: T) => {
      const mapped = mapCandidate(candidate)
      return validator(mapped)
    }
  }

  return validators
    .map(v => Array.isArray(v) ? v.map(wrap) : wrap(v))
    .flat()
}

/**
 * Maps a value, permitting you to perform validation operations on the mapped value
 * within the calling context of this function. Validator evaluation is lazy.
 * 
 * @alias whenMapped
 * 
 * @param map 
 * A mapping function for the candidate
 */
export function andWhenMapped<T, U>(
  mapCandidate: (t: T) => U,
  ...validators: ValidatorFunctions<U>
): ValidatorFunction<T>[] {
  return whenMapped(mapCandidate, ...validators)
}

