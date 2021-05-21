import { IValidatorContext, ValidationFunction } from './validation/validators'

export interface IIndividualValidationResult<T> {
  actualValue: T
  satisfiesCondition: boolean
  failureMessage: string
}

export type Input<T> = Array<ValidationFunction<T>> | ValidationFunction<T>

/**
 * A `Must` function - a variadic function that accepts validators.
 */
export type MustFunction<T> = (...validators: Input<T>[]) => IMustContext

/**
 * 
 */
interface IMustContext {
  flatten(): IValidatorContext
}

/**
 * Creates a validation context.
 */
export function createValidationContext<T>() {
  const propertyValidators = new Map<keyof T, ValidationFunction<T[keyof T]>[]>()

  function makeMustFunction<U extends keyof T>(forProperty: U) {
    return (...validators: ValidationFunction<T[U]>[]) => {
      propertyValidators.set(forProperty, validators as ValidationFunction<T[keyof T]>[])
    }
  }
  
  return {
    valueFor<U extends keyof T>(property: U) {
      return { must: makeMustFunction(property) }
    },

    validate: (toValidate: T) => {
      let results: IValidatorContext[] = []

      for (const [property, validators] of propertyValidators) {
        const candidate = toValidate[property]
        results = results.concat(
          validators.map(v => v(candidate))
        )
      
      }

      return results.every(r => r.satisfiesCondition)
    }
  }
}

function makeMustFunction<T>(candidate: T, candidateName?: string) {
  return (...validators: Input<T>[]) => {
    const result = validators.map(v => v(candidate))

    return {
      flatten() {
        return true
      }
    }
  }
}

export function value<T>(candidate: T, candidateName?: string) {
  return { must: makeMustFunction(candidate, candidateName) }
}