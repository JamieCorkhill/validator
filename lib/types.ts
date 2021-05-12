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