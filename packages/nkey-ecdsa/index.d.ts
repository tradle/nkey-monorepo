import { API, KeyFor, SignKey } from 'nkey'

export type Type = 'ecdsa'

export type ECDSAKey = KeyFor<SignKey & {
  type: Type
  priv?: Buffer | null
}>

export interface ECDSAOpts {
  // TODO: we should have a list of supported curves here
  curve?: string
}

export type NkeyECDSA = API<Type, ECDSAKey, ECOpts>

const api: NkeyECDSA

export = api
