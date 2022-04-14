import { API, KeyFor } from 'nkey'

export type Type = 'ec'

export type ECKey = KeyFor<AnyKey & {
  type: Type
  curve: string
}>

export interface ECOpts {
  curve?: string
}

export type NkeyEC = API<Type, ECKey, ECOpts> & {
  DEFAULT_CURVE: string
}

const api: NkeyEC

export = api
