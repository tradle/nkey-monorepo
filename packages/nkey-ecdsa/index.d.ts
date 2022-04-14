import { AnyKey, API, KeyFor } from 'nkey'

export type Type = 'ecdsa'

export type ECDSAKey = KeyFor<AnyKey & {
  type: Type
  curve: string
}>

export interface ECDSAOpts {
  // TODO: we should have a list of supported curves here
  curve?: string
}

export type NkeyECDSA = API<Type, ECDSAKey, ECOpts> & {
  DEFAULT_ALGORITHM: string
  DEFAULT_CURVE: string
  setImplementationForCurve (curve: string, impl: API): void
}

const api: NkeyECDSA

export = api
