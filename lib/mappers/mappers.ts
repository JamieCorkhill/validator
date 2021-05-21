import { IHasLength } from './../types'

export type MapperFunction<T, U> = (candidate: T) => U

/**
 * Maps a candidate to its length property.
 */
export function toLength<T extends IHasLength>(): MapperFunction<T, number> {
  return (candidate) => candidate.length
}

/**
 * Maps a candidate to the index of a char within it.
 */
export function toIndexOf(char: string): MapperFunction<string, number> {
  return (candidate) => candidate.indexOf(char)
}