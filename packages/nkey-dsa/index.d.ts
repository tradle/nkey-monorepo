import { API, KeyFor, SignKey } from 'nkey'

export type Type = 'dsa'

export type DSAKey = KeyFor<SignKey & {
  type: Type
  priv?: DSA | null
}>

export type NkeyDSA = API<Type, DSAKey>

const api: NkeyDSA

export = api

export interface DSA {
  p: number[]
  q: number[]
  g: number[]
  type: string
  x: number[]
  y: number[]

  // TODO: Add types for functions
}
