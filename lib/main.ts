import { IValidatorContext, ValidatorFunction } from './validation/validators'

/**
 * Validator functions that can be provided to a variadic validator parent, such as a
 * `must` function.
 */
export type ValidatorFunctions<T> = (Array<ValidatorFunction<T>> | ValidatorFunction<T>)[]

/**
 * A `must` function - a variadic function that accepts an array of validators
 * and tests the candidate against the predicate in each one.
 */
export type MustFunction<T> = (...validators: ValidatorFunctions<T>) => IMustContext

/**
 * Work in progress.
 */
export interface IMustContext {
  flatten(): IValidatorContext
}

/**
 * A validation context that permits the specification of validators on a
 * per-property basis.
 */
export interface IValidationContext<T> {
  /**
   * Starts a child validation context scoped to the given value.
   * Execution of validators is deferred.
   */
  valueFor<U extends keyof T>(property: U): MustFunction<T>

  /**
   * Runs all validators against the candidate provided.
   */
  validate(candidate?: T): IValidationResult<T>
}

/**
 * Validation result enum.
 */
export enum ValidationResult {
  Success,
  Failure
}

/**
 * A validation result.
 */
export interface IValidationResult<T> {
  /**
   * Boolean value indicating that validation completed successfully.
   */
  isSuccess: boolean

  /**
   * Boolean value indicating that validation did not complete successfully.
   */
  isFailure: boolean

  /**
   * Validation result in enum format.
   */
  result: ValidationResult

  /**
   * Provides an array of validation errors.
   */
  getErrors(): IValidationError<T>[]

  /**
   * Throws a `ValidationError` if the validation result is not successful.
   * 
   * @param errorFactory 
   * An optional factory that permits the throwing of custom exceptions. If you
   * return an error from this factory, it will be thrown.
   */
  throwIfInvalid(errorFactory?: (validationErrors: IValidationError<T>[]) => Error): void
}

/**
 * A validation error.
 */
export interface IValidationError<T> {
  property: keyof T
  message: string
}

/**
 * Creates a validation context.
 */
export function createValidationContext<T>(toValidateOptOne?: T) {
  const propertyValidators = new Map<keyof T, ValidatorFunction<T[keyof T]>[]>()

  /**
   * Constructs a must function for the specified property.
   */
  function _makeMustFunction<U extends keyof T>(forProperty: U) {
    return (...validators: ValidatorFunctions<T[U]>) => {
      propertyValidators.set(
        forProperty, 
        validators.flat() as ValidatorFunction<T[keyof T]>[]
      )
    }
  }
  
  return {
    valueFor<U extends keyof T>(property: U) {
      return {
        must: _makeMustFunction(property) 
      }
    },

    validate(toValidateOptTwo?: T) {
      if (!toValidateOptOne && !toValidateOptTwo) {
        // TODO: custom exception
        throw new Error()
      }

      const candidate = toValidateOptOne || toValidateOptTwo as T
      

      // Run all validators for all properties and store the resultant contexts.
      const resultantContexts: IValidatorContext[] = []
      const propertyContexts = new Map<keyof T, IValidatorContext[]>()
      for (const [property, validators] of propertyValidators) {
        const validatorResults = validators
          .map(v => v(candidate[property]))

        // Both of these could be put together so we only loop once,
        // but I kind of like the look of this more...
        validatorResults
          .forEach(rc => resultantContexts.push(rc))

        validatorResults
          .forEach(rc => propertyContexts.has(property)
            ? propertyContexts.get(property)!.push(rc)
            : propertyContexts.set(property, [rc])
          )
      }

      const isSuccessful = resultantContexts.every(r => r.satisfiesCondition)

      return {
        isSuccessful,

        isFailure: !isSuccessful,

        result: isSuccessful
          ? ValidationResult.Success
          : ValidationResult.Failure,

        getErrors(): IValidationError<T>[] {
          return Array.from(propertyContexts)
            .flatMap(([property, validationResults]) => {
              return validationResults
                .filter(r => !r.satisfiesCondition)
                .map(r => ({
                  property,
                  message: r.message
                }))
            })
        },

        throwIfInvalid(errorFactory?: (validationErrors: IValidationError<T>[]) => Error) {
          if (isSuccessful) {
            return
          }

          const errors = this.getErrors()

          if (errorFactory) {
            throw errorFactory(errors)
          }

          // TODO: Make this a custom exception, pass the errors in.
          throw new Error()
        }
      }
    }
  }
}

// WORK IN PROGRESS:
function makeMustFunction<T>(candidate: T, candidateName?: string) {
  return (...validators: ValidatorFunctions<T>[]) => {
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