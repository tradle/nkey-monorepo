import { API, KeyFor, AnyKey } from 'nkey'

export type Type = 'curve25519'

export type Curve25519Key = KeyFor<AnyKey & {
  type: Type
  priv?: Buffer | null
  ecdh (pub: Uint8Array): Buffer 
}>

export type NKeyCurve25519 = API<Type, Curve25519Key>

const api: NKeyCurve25519

export = api
