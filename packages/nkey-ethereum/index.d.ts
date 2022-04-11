import { API, KeyFor, AnyKey } from 'nkey'

export type Type = 'ethereum'

export type EthereumKey = KeyFor<AnyKey & {
  type: Type
  priv?: Buffer | null
}>

export interface EthereumOpts {
  networkName?: string
  icapDirect?: boolean
}

export type NkeyEthereum = API<Type, EthereumKey, EthereumOpts>

const api: NkeyEthereum

export = api
