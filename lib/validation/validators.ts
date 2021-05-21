import { IHasIncludes, IHasLength, Type } from '../types'
import { value } from '../main'
import { not, andWhenMapped } from './modifiers'
import { toIndexOf, toLength } from './../mappers/mappers'

/**
 * A function that returns a validator context.
 */
export type ValidationFunction<T> = (candidate: T) => IValidatorContext;

/**
 * A function that performs validation on a candidate and returns a 
 * boolean indicating the validation result.
 */
export type ValidationPredicate<T> = (candidate: T) => boolean

/**
 * Context for a validation function.
 */
export interface IValidatorContext {
  message: string
  satisfiesCondition: boolean
}

export type OtherwiseFunction = (message: string) => string

export function otherwise(message: string) {
  return message
}

export function makeValidatorContext<T>(
  predicate: ValidationPredicate<T>, 
  makeMessage: (candidate: T) => string
): ValidationFunction<T> {
  return (candidate: T) => ({
    message: makeMessage(candidate),
    satisfiesCondition: predicate(candidate)
  })
}

function withDefaultMessage(defaultMessage: string, provided?: string) {
  return provided || defaultMessage
}

function stringify<T>(value: T) {
  return `${value}`
}

function makeGeneralMessage(expected: any, received: any) {
  return `Expected value ${expected}, but received value ${received}`
}

/**
 * Verifies that the value is null or empty. It must be one of the following:
 * null, undefined, an empty string, an empty object.
 */
export function beNullOrEmpty<T>(message?: string): ValidationFunction<T> {
  return makeValidatorContext(
    (candidate) => !candidate,
    (candidate) => withDefaultMessage(
      `Expected a null or empty value, but found value ${stringify(candidate)}`,
      message
    )
  )
}

/**
 * Verifies that the value is null.
 */
export function beNull<T>(message?: string): ValidationFunction<T> {
  return makeValidatorContext(
    (candidate) => candidate == null,
    (candidate) => withDefaultMessage(
      `Expected a null value, but found value ${stringify(candidate)}`,
      message
    )
  )
}

/**
 * Verifies that the value is undefined.
 */
export function beUndefined<T>(message?: string): ValidationFunction<T> {
  return makeValidatorContext(
    (candidate) => candidate == undefined,
    (candidate) => withDefaultMessage(
      `Expected an undefined value, but found value ${candidate}`,
      message
    )
  )
}

/**
 * Verifies that the value is empty. This means an empty string if the
 * value is a string or an object with no properties if the value
 * is an object.
 */
export function beEmpty<T extends { [key: string]: any }>(message?: string): ValidationFunction<T> {
  function predicate(candidate: T) {
    if (typeof candidate === 'string' && candidate === '') {
      return true
    } 

    if (typeof candidate === 'object' && Object.keys(candidate).length === 0)  {
      return true
    }

    return false
  }

  return makeValidatorContext(
    predicate,
    _ => withDefaultMessage(
      'Expected an empty value, but the provided value was not empty',
      message
    )
  )
}

/**
 * Verifies that the value is of the expected type.
 * 
 * @param expectedType 
 * The expected type for the value.
 */
export function beOfType<T>(expectedType: Type, message?: string): ValidationFunction<T> {
  return makeValidatorContext(
    (candidate) => typeof candidate === expectedType,
    (candidate) => withDefaultMessage(
      `Expected a type of ${expectedType}, but found a type of ${typeof candidate}`,
      message
    )
  )
}

/**
 * Checks lose equality between the value and the expected value.
 * 
 * @param expectedValue 
 * Expected value with which to perform a lose equality check.
 */
export function equal<T>(expectedValue: T, message?: string): ValidationFunction<T> {
  return makeValidatorContext(
    (candidate) => candidate == expectedValue,
    (candidate) => withDefaultMessage(
      `Expected loose equality with ${expectedValue}, but found ${candidate}`,
      message
    )
  )
}

/**
 * Checks strict reference equality between the value and the expected value.
 * 
 * @alias be
 * 
 * @param expectedValue 
 * Expected value with which to perform a strict equality (reference) check. 
 */
export function strictlyEqual<T>(expectedValue: T, message?: string): ValidationFunction<T> {
  return makeValidatorContext(
    (candidate) => value(candidate)
      .must(be(expectedValue))
      .flatten(),
    (candidate) => withDefaultMessage(
      `Expected strict reference equality with ${expectedValue} but found ${candidate}`,
      message
    )
  )
}

/**
 * Checks strict reference equality between the value and the expected value.
 * 
 * @alias strictlyEqual
 * 
 * @param expectedValue 
 * Expected value with which to perform a strict equality (reference) check. 
 */
export function be<T>(expectedValue: T, message?: string): ValidationFunction<T> {
  return strictlyEqual(expectedValue, message)
}

/**
 * Verifies that the value has the exact length specified.
 * 
 * @param expectedLength 
 * Length to check.
 */
export function haveLength<T extends IHasLength>(expectedLength: number): ValidationFunction<T> {
  return makeValidatorContext(
    (candidate) => value(candidate)
      .must(
        haveProperty('length'),
        andWhenMapped(
          toLength(),
          be(expectedLength)
        )
      )
      .flatten(),
    (candidate) => withDefaultMessage(
      `Expected length of ${expectedLength}, but found length of ${candidate.length}`
    )
  )
}

/**
 * Verifies that the length of the value is inclusively within the length bounds.
 * 
 * @param min 
 * The inclusive minimum.
 * 
 * @param max 
 * The inclusive maximum.
 */
export function haveLengthInclusivelyBetween<T extends IHasLength>(
  min: number, 
  max: number,
  message?: string
): ValidationFunction<T> {
  return makeValidatorContext(
    (candidate) => value(candidate)
      .must(
        haveProperty('length'),
        andWhenMapped(
          toLength(),
          beInclusivelyBetween(min, max)
        )
      )
      .flatten(),
    (candidate) => withDefaultMessage(
      `Expected a length exclusively between ${min} and ${max}, but found length ${candidate.length}`,
      message
    )
  )
}

/**
 * Verifies that the length of the value is exclusively within the length bounds.
 * 
 * @param min 
 * The exclusive minimum.
 * 
 * @param max 
 * The exclusive maximum.
 */
export function haveLengthExclusivelyBetween<T extends IHasLength>(
  min: number, 
  max: number,
  message?: string
): ValidationFunction<T> {
  return makeValidatorContext(
    (candidate) => value(candidate)
      .must(
        haveProperty('length'),
        andWhenMapped(
          toLength(),
          beExclusivelyBetween(min, max)
        )
      )
      .flatten(),
    (candidate) => withDefaultMessage(
      `Expected a length inclusively between ${min} and ${max}, but found length ${candidate.length}`,
      message
    )
  )
}

/**
 * Verifies that the value has at least the minimum length specified.
 * 
 * @param min 
 * The minimum that the value can have.
 */
export function haveMinimumLength<T extends IHasLength>(min: number, message?: string): ValidationFunction<T> {
  return makeValidatorContext(
    (candidate) => value(candidate)
      .must(
        haveProperty('length'),
        andWhenMapped(
          toLength(),
          beGreaterThanOrEqualTo(min)
        )
      )
      .flatten(),
    (candidate) => withDefaultMessage(
      `Expected a length greater than or equal to ${min}, but found length ${candidate.length}`,
      message
    )
  )
}

/**
 * Verifies that the value has a length under the maximum length specified.
 * 
 * @param min 
 * The maximum length that the value can have.
 */
export function haveMaximumLength<T extends IHasLength>(max: number, message?: string): ValidationFunction<T> {
  return makeValidatorContext(
    (candidate) => value(candidate)
      .must(
        haveProperty('length'),
        andWhenMapped(
          toLength(),
          beLessThanOrEqualTo(max)
        )
      )
      .flatten(),
    (candidate) => withDefaultMessage(
      `Expected a less than or equal to ${max}, but found length ${candidate.length}`,
      message
    )
  )
}

/**
 * Verifies that the value is less than the upper limit specified.
 * 
 * @param upperLimit 
 * The (exclusive) maximum the value can be.
 */
export function beLessThan(upperLimit: number, message?: string): ValidationFunction<number> {
  return makeValidatorContext(
    (candidate) => candidate < upperLimit,
    (candidate) => withDefaultMessage(
      `The value ${candidate} is greater than the upper limit specified`,
      message
    )
  )
}

/**
 * Verifies that the value is less than or equal to upper limit specified.
 * 
 * @param upperLimit 
 * The (inclusive) maximum the value can be.
 */
export function beLessThanOrEqualTo(upperLimit: number, message?: string): ValidationFunction<number> {
  return makeValidatorContext(
    (candidate) => candidate <= upperLimit,
    (candidate) => withDefaultMessage(
      `The value ${candidate} is greater than the upper limit specified`,
      message
    )
  )
}

/**
 * Verifies that the value is greater than the lower limit specified.
 * 
 * @param lowerLimit 
 * The (exclusive) minimum the value can be.
 */
export function beGreaterThan(lowerLimit: number, message?: string): ValidationFunction<number> {
  return makeValidatorContext(
    (candidate) => candidate > lowerLimit,
    (candidate) => withDefaultMessage(
      `The value ${candidate} is less than the lower limit specified`,
      message
    )
  )
}

/**
 * Verifies that the value is greater than or equal to the lower limit specified.
 * 
 * @param lowerLimit 
 * The (inclusive) minimum the value can be.
 */
export function beGreaterThanOrEqualTo(lowerLimit: number, message?: string): ValidationFunction<number> {
  return makeValidatorContext(
    (candidate) => candidate >= lowerLimit,
    (candidate) => withDefaultMessage(
      `The value ${candidate} is less than the lower limit specified`,
      message
    )
  )
}

/**
 * Verifies the value against a custom predicate.
 * 
 * @alias satisfy
 * 
 * @param predicate 
 * A custom predicate function for assertions.
 */
export function must<T>(predicate: (value: T) => boolean, message?: string): ValidationFunction<T> {
  return satisfy(predicate, message)
}

/**
 * Verifies the value against a custom predicate.
 * 
 * @alias must
 * 
 * @param predicate 
 * A custom predicate function for assertions.
 */
export function satisfy<T>(predicate: (value: T) => boolean, message?: string): ValidationFunction<T> {
  return makeValidatorContext(
    predicate,
    (candidate) => withDefaultMessage(
      `The value ${candidate} did not satisfy the predicate`,
      message
    )
  )
}

/**
 * Verifies the value against the Regular Expression specified.
 * 
 * @param regex 
 * The Regular Expression to verify against.
 */
export function match(regex: RegExp, message?: string): ValidationFunction<string> {
  return makeValidatorContext(
    (candidate) => regex.test(candidate),
    (candidate) => withDefaultMessage(
      `Expected ${candidate} to satisfy the Regular Expression, but it did not`,
      message
    )
  )
}

/**
 * Verifies that a value is an email address.
 */
export function beEmailAddress(message?: string): ValidationFunction<string> {
  return makeValidatorContext(
    (candidate) => value(candidate)
      .must(
        beOfType('string'),
        andWhenMapped(
          toIndexOf('@'),
          not(
            be(-1),
            be(0),
            be(candidate.length - 1)
          )
        )
      )
      .flatten(),
    _ => withDefaultMessage(
      'The provided value was not of an email address format.',
      message
    )
  )
}

/**
 * Verifies that the value is a valid UUID/GUID.
 */
export function beUuid(message?: string): ValidationFunction<string> {
  return makeValidatorContext(
    (candidate) => value(candidate)
      .must(match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i))
      .flatten(),
    _ => withDefaultMessage(
      'Expected the value to be a UUID, but it was not.',
      message
    )
  )
}

/**
 * Verifies that the value contains the property specified.
 * 
 * @param property 
 * The property to ensure the value has.
 */
export function haveProperty<T>(property: keyof T, message?: string): ValidationFunction<T> {
  return makeValidatorContext(
    (candidate) => (candidate as any)[property] !== undefined,
    (candidate) => withDefaultMessage(
      `Expected ${candidate} to contain the property ${property}, but it did not`,
      message
    )
  )
}

/**
 * Verifies that the value is inclusively within the range specified.
 * 
 * @param min 
 * The inclusive minimum the value can be.
 * 
 * @param max 
 * The inclusive maximum the value can be.
 */
export function beInclusivelyBetween(min: number, max: number, message?: string): ValidationFunction<number> {
  return makeValidatorContext(
    (candidate) => candidate >= min && candidate <= max,
    (candidate) => withDefaultMessage(
      `Expected a value inclusively between ${min} and ${max}, but found ${candidate}`,
      message
    )
  )
}

/**
 * Verifies that the value is exclusively within the range specified.
 * 
 * @param min 
 * The exclusive minimum the value can be.
 * 
 * @param max 
 * The exclusive maximum the value can be.
 * 
 */
export function beExclusivelyBetween(min: number, max: number, message?: string): ValidationFunction<number> {
  return makeValidatorContext(
    (candidate) => candidate > min && candidate < max,
    (candidate) => withDefaultMessage(
      `Expected a value exclusively between ${min} and ${max}, but found ${candidate}`,
      message
    )
  )
}

/**
 * Verifies that the value is provided (is not null or empty).
 * 
 * @alias not(nullOrEmpty())
 */
export function beProvided<T>(message?: string): ValidationFunction<T> {
  return makeValidatorContext(
    (candidate) => value(candidate)
      .must(not(beNullOrEmpty()))
      .flatten(),
    _ => withDefaultMessage(
      'The value must not be null or empty',
      message
    )
  )
}

/**
 * Verifies that the value is included within the specified array.
 * 
 * @param elements 
 * The element array within which the value must be included.
 */
export function beIncludedWithin<T>(value: IHasIncludes<T>, message?: string): ValidationFunction<T> {
  return makeValidatorContext(
    (candidate) => value.includes(candidate),
    (candidate) => withDefaultMessage(
      `Expected value ${candidate} to be included within ${value} but it was not`,
      message
    )
  )
}

/**
 * Verifies that the value is excluded from the specified array.
 * 
 * @param elements 
 * The element array within which the value must be excluded.
 */
export function beExcludedFrom<T>(test: IHasIncludes<T>, message?: string): ValidationFunction<T> {
  return makeValidatorContext(
    (candidate) => value(candidate)
      .must(not(beIncludedWithin(test)))
      .flatten(),
    (candidate) => withDefaultMessage(
      `Expected value ${candidate} to be excluded from ${test}, but it was not`,
      message
    )
  )
}

// /**
//  * Verifies that the value is null or empty. It must be one of the following:
//  * null, undefined, an empty string, an empty object.
//  */
// export function beNullOrEmpty<T>(): ValidationFunction<T> {
//   return (candidate) => !candidate
// }

// /**
//  * Verifies that the value is null.
//  */
// export function beNull<T>(): ValidationFunction<T> {
//   return (candidate) => candidate == null
// }

// /**
//  * Verifies that the value is undefined.
//  */
// export function beUndefined<T>(): ValidationFunction<T> {
//   return (candidate) => candidate == undefined
// }

// /**
//  * Verifies that the value is empty. This means an empty string if the
//  * value is a string or an object with no properties if the value
//  * is an object.
//  */
// export function beEmpty<T extends { [key: string]: any }>(): ValidationFunction<T> {
//   return (candidate) => {
//     if (typeof candidate === 'string' && candidate === '') {
//       return true
//     } 

//     if (typeof candidate === 'object' && Object.keys(candidate).length === 0)  {
//       return true
//     }

//     return false
//   }
// }

// /**
//  * Verifies that the value is of the expected type.
//  * 
//  * @param expectedType 
//  * The expected type for the value.
//  */
// export function beOfType<T>(expectedType: Type): ValidationFunction<T> {
//   return (candidate) => typeof candidate === expectedType
// }

// /**
//  * Checks lose equality between the value and the expected value.
//  * 
//  * @param expectedValue 
//  * Expected value with which to perform a lose equality check.
//  */
// export function equal<T>(expectedValue: T): ValidationFunction<T> {
//   return (candidate) => candidate == expectedValue
// }

// /**
//  * Checks strict reference equality between the value and the expected value.
//  * 
//  * @alias be
//  * 
//  * @param expectedValue 
//  * Expected value with which to perform a strict equality (reference) check. 
//  */
// export function strictlyEqual<T>(expectedValue: T): ValidationFunction<T> {
//   return be(expectedValue)
// }

// /**
//  * Checks strict reference equality between the value and the expected value.
//  * 
//  * @alias strictlyEqual
//  * 
//  * @param expectedValue 
//  * Expected value with which to perform a strict equality (reference) check. 
//  */
// export function be<T>(expectedValue: T): ValidationFunction<T> {
//   return (candidate) => candidate === expectedValue
// }

// /**
//  * Verifies that the value has the exact length specified.
//  * 
//  * @param expectedLength 
//  * Length to check.
//  */
// export function haveLength<T extends IHasLength>(expectedLength: number): ValidationFunction<T> {
//   return (candidate) => value(candidate)
//     .must(
//       haveProperty('length'),
//       andWhenMapped(
//         toLength(),
//         be(expectedLength)
//       )
//     )
//     .flatten()
// }

// /**
//  * Verifies that the length of the value is inclusively within the length bounds.
//  * 
//  * @param min 
//  * The inclusive minimum.
//  * 
//  * @param max 
//  * The inclusive maximum.
//  */
// export function haveLengthInclusivelyBetween<T extends IHasLength>(
//   min: number, 
//   max: number
// ): ValidationFunction<T> {
//   return (candidate) => value(candidate)
//     .must(
//       haveProperty('length'),
//       andWhenMapped(
//         toLength(),
//         beInclusivelyBetween(min, max)
//       )
//     )
//     .flatten()
// }

// /**
//  * Verifies that the length of the value is exclusively within the length bounds.
//  * 
//  * @param min 
//  * The exclusive minimum.
//  * 
//  * @param max 
//  * The exclusive maximum.
//  */
// export function haveLengthExclusivelyBetween<T extends IHasLength>(
//   min: number, 
//   max: number
// ): ValidationFunction<T> {
//   return (candidate) => value(candidate)
//     .must(
//       haveProperty('length'),
//       andWhenMapped(
//         toLength(),
//         beExclusivelyBetween(min, max)
//       )
//     )
//     .flatten()
// }

// /**
//  * Verifies that the value has at least the minimum length specified.
//  * 
//  * @param min 
//  * The minimum that the value can have.
//  */
// export function haveMinimumLength<T extends IHasLength>(min: number): ValidationFunction<T> {
//   return (candidate) => value(candidate)
//     .must(
//       haveProperty('length'),
//       andWhenMapped(
//         toLength(),
//         beGreaterThanOrEqualTo(min)
//       )
//     )
//     .flatten()
// }

// /**
//  * Verifies that the value has a length under the maximum length specified.
//  * 
//  * @param min 
//  * The maximum length that the value can have.
//  */
// export function haveMaximumLength<T extends IHasLength>(max: number): ValidationFunction<T> {
//   return (candidate) => value(candidate)
//     .must(
//       haveProperty('length'),
//       andWhenMapped(
//         toLength(),
//         beLessThanOrEqualTo(max)
//       )
//     )
//     .flatten()
// }

// /**
//  * Verifies that the value is less than the upper limit specified.
//  * 
//  * @param upperLimit 
//  * The (exclusive) maximum the value can be.
//  */
// export function beLessThan(upperLimit: number): ValidationFunction<number> {
//   return (candidate) => candidate < upperLimit
// }

// /**
//  * Verifies that the value is less than or equal to upper limit specified.
//  * 
//  * @param upperLimit 
//  * The (inclusive) maximum the value can be.
//  */
// export function beLessThanOrEqualTo(upperLimit: number): ValidationFunction<number> {
//   return (candidate) => candidate <= upperLimit
// }

// /**
//  * Verifies that the value is greater than the lower limit specified.
//  * 
//  * @param lowerLimit 
//  * The (exclusive) minimum the value can be.
//  */
// export function beGreaterThan(lowerLimit: number): ValidationFunction<number> {
//   return (candidate) => candidate > lowerLimit
// }

// /**
//  * Verifies that the value is greater than or equal to the lower limit specified.
//  * 
//  * @param lowerLimit 
//  * The (inclusive) minimum the value can be.
//  */
// export function beGreaterThanOrEqualTo(lowerLimit: number): ValidationFunction<number> {
//   return (candidate) => candidate >= lowerLimit
// }

// /**
//  * Verifies the value against a custom predicate.
//  * 
//  * @alias satisfy
//  * 
//  * @param predicate 
//  * A custom predicate function for assertions.
//  */
// export function must<T>(predicate: (value: T) => boolean): ValidationFunction<T> {
//   return predicate
// }

// /**
//  * Verifies the value against a custom predicate.
//  * 
//  * @alias must
//  * 
//  * @param predicate 
//  * A custom predicate function for assertions.
//  */
// export function satisfy<T>(predicate: (value: T) => boolean): ValidationFunction<T> {
//   return predicate
// }

// /**
//  * Verifies the value against the Regular Expression specified.
//  * 
//  * @param regex 
//  * The Regular Expression to verify against.
//  */
// export function match(regex: RegExp): ValidationFunction<string> {
//   return (candidate) => regex.test(candidate)
// }

// /**
//  * Verifies that a value is an email address.
//  */
// export function beEmailAddress(): ValidationFunction<string> {
//   return (candidate) => value(candidate)
//     .must(
//       beOfType('string'),
//       andWhenMapped(
//         toIndexOf('@'),
//         not(
//           be(-1),
//           be(0),
//           be(candidate.length)
//         )
//       )
//     )
//     .flatten()
// }

// /**
//  * Verifies that the value is a valid UUID/GUID.
//  */
// export function beUuid(): ValidationFunction<string> {
//   return (candidate) => value(candidate)
//     .must(match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i))
//     .flatten()
// }

// /**
//  * Verifies that the value contains the property specified.
//  * 
//  * @param property 
//  * The property to ensure the value has.
//  */
// export function haveProperty<T>(property: keyof T): ValidationFunction<T> {
//   return (candidate) => (candidate as any)[property] !== undefined
// }

// /**
//  * Verifies that the value is inclusively within the range specified.
//  * 
//  * @param min 
//  * The inclusive minimum the value can be.
//  * 
//  * @param max 
//  * The inclusive maximum the value can be.
//  */
// export function beInclusivelyBetween(min: number, max: number): ValidationFunction<number> {
//   return (candidate) => candidate >= min && candidate <= max
// }

// /**
//  * Verifies that the value is exclusively within the range specified.
//  * 
//  * @param min 
//  * The exclusive minimum the value can be.
//  * 
//  * @param max 
//  * The exclusive maximum the value can be.
//  * 
//  */
// export function beExclusivelyBetween(min: number, max: number): ValidationFunction<number> {
//   return (candidate) => candidate > min && candidate < max
// }

// /**
//  * Verifies that the value is provided (is not null or empty).
//  * 
//  * @alias not(nullOrEmpty())
//  */
// export function beProvided<T>(): ValidationFunction<T> {
//   return (candidate) => value(candidate)
//     .must(not(beNullOrEmpty()))
//     .flatten()
// }

// /**
//  * Verifies that the value is included within the specified array.
//  * 
//  * @param elements 
//  * The element array within which the value must be included.
//  */
// export function beIncludedWithin<T>(elements: T[]): ValidationFunction<T> {
//   return (candidate) => elements.includes(candidate)
// }

// /**
//  * Verifies that the value is excluded from the specified array.
//  * 
//  * @param elements 
//  * The element array within which the value must be excluded.
//  */
// export function beExcludedFrom<T>(elements: T[]): ValidationFunction<T> {
//   return (candidate) => value(candidate)
//     .must(not(beIncludedWithin(elements)))
//     .flatten()
// }