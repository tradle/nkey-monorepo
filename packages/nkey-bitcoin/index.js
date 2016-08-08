'use strict'

const crypto = require('crypto')
const bitcoin = require('@tradle/bitcoinjs-lib')
const nkey = require('nkey')
const type = 'bitcoin'
const impl = nkey.wrap({
  type,
  genSync,
  fromJSON
})

module.exports = exports = impl

exports.DEFAULT_NETWORK = 'bitcoin'

function genSync (opts) {
  const networkName = opts.networkName || exports.DEFAULT_NETWORK
  return impl.fromJSON({
    priv: bitcoin.ECKey.makeRandom(),
    networkName
  })
}

function fromJSON (opts) {
  if (!(opts.priv || opts.pub)) {
    throw new Error('expected "priv" or "pub"')
  }

  const networkName = opts.networkName
  const network = bitcoin.networks[networkName]
  if (!network) throw new Error('invalid "networkName"')

  let key
  let priv = opts.priv
  let pub = opts.pub
  let privKeyString
  let pubKeyString
  if (typeof priv === 'string') {
    privKeyString = priv
    key = bitcoin.ECKey.fromWIF(priv)
  } else if (priv) {
    privKeyString = priv.toWIF(network)
    key = priv
  } else if (typeof pub === 'string') {
    pubKeyString = pub
    key = bitcoin.ECPubKey.fromHex(pub)
    pub = key
  } else {
    key = pub
  }

  // if (!pubKeyString) pubKeyString = pub.toString('hex')

  let fingerprint
  const api = {
    type,
    signSync,
    verifySync,
    hasDeterministicSig: true,
    // pubKeyString,
    // fingerprint,
    // pub,
    // priv,
    toJSON
  }

  // lazy, could be expensive
  Object.defineProperty(api, 'pub', {
    enumerable: true,
    get: function () {
      return key.pub || key
    }
  })

  Object.defineProperty(api, 'pubKeyString', {
    enumerable: true,
    get: function () {
      if (!pubKeyString) {
        pubKeyString = api.pub.toHex()
      }

      return pubKeyString
    }
  })

  Object.defineProperty(api, 'fingerprint', {
    enumerable: true,
    get: function () {
      if (!fingerprint) {
        fingerprint = api.pub.getAddress(network).toString()
      }

      return fingerprint
    }
  })

  return nkey.wrap(api)

  function signSync (msg) {
    if (!priv) throw new Error('this is a public key')

    return key.sign(msg).toDER()
  }

  function verifySync (msg, sig) {
    return api.pub.verify(msg, bitcoin.ECSignature.fromDER(sig))
  }

  function toJSON (exportPrivate) {
    const obj = {
      type,
      networkName,
      fingerprint: api.fingerprint,
      pub: api.pubKeyString,
    }

    if (exportPrivate) obj.priv = privKeyString

    return obj
  }
}
