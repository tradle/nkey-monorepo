import { API, KeyFor, SignKey } from 'nkey'

export type Type = 'bitcoin'

export type BitcoinKey = KeyFor<SignKey & {
  type: Type
  priv?: Buffer | null
  wif: string
}>

export interface BitcoinOpts {
  networkName?: string
}

export type NKeyBitcoin = API<Type, BitcoinKey, BitcoinOpts> & {
  DEFAULT_NETWORK: string
}

const api: NKeyBitcoin

export = api
