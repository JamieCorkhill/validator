/**
 * A value with a length
 */
export interface IHasLength {
  length: number
}

/**
 * A basic type for a value.
 */
 export type Type = 'string'
 | 'boolean'
 | 'object'
 | 'function'
 | 'bigint'
 | 'undefined'
 | 'symbol'
 | 'number'

/**
 * A structure for which you can assert on whether an element is included.
 */
export interface IHasIncludes<T> {
  includes(value: T): boolean
}