import { API, KeyFor, SignKey } from 'nkey'

export type Type = 'secp256k1'

export type Secp256k1Key = KeyFor<SignKey & {
  type: Type
  priv?: Buffer | null
}>

export type NkeySecp256k1 = API<Type, Secp256k1Key>

const api: NkeySecp256k1

export = api
