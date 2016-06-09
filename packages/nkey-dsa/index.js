'use strict'

const crypto = require('crypto')
const DSA = require('@tradle/otr').DSA
const BigInt = require('@tradle/otr/vendor/bigint')
const bits2bigInt = require('@tradle/otr/lib/helpers').bits2bigInt
const nkey = require('nkey')
const type = 'dsa'

module.exports = nkey.wrap({
  type,
  genSync,
  fromJSON
})

function genSync (opts) {
  return fromJSON({
    priv: new DSA()
  })
}

function fromJSON (opts) {
  if (!(opts.priv || opts.pub)) {
    throw new Error('expected "priv" or "pub"')
  }

  let key, pubKeyString, privKeyString
  if (typeof opts.priv === 'string') {
    privKeyString = opts.priv
    key = DSA.parsePrivate(opts.priv)
  } else if (opts.priv) {
    key = opts.priv
    privKeyString = key.packPrivate()
  } else if (typeof opts.pub === 'string') {
    pubKeyString = opts.pub
    key = DSA.parsePublic(new Buffer(opts.pub, 'base64').toString('binary'))
  } else {
    key = opts.pub
  }

  const priv = opts.priv && key
  const pub = new Buffer(key.packPublic(), 'binary')
  if (!pubKeyString) {
    pubKeyString = pub.toString('base64')
  }

  const fingerprint = key.fingerprint()
  return nkey.wrap({
    type,
    signSync,
    verifySync,
    hasDeterministicSig: false,
    pubKeyString,
    fingerprint,
    pub,
    priv,
    toJSON
  })

  function signSync (msg) {
    return toString(key.sign(msg))
  }

  function verifySync (msg, sig) {
    sig = parseSig(sig)
    return !!DSA.verify(key, msg, sig[0], sig[1])
  }

  function toJSON (exportPrivate) {
    const obj = {
      type,
      pub: pubKeyString,
      fingerprint
    }

    if (exportPrivate) obj.priv = privKeyString

    return obj
  }
}

function toString (sig) {
  return new Buffer(
    BigInt.bigInt2bits(sig[0], 20) + BigInt.bigInt2bits(sig[1], 20),
    'binary'
  ).toString('base64')
}

function parseSig (sig) {
  sig = new Buffer(sig, 'base64').toString('binary')
  var r = bits2bigInt(sig.slice(0, 20))
  var s = bits2bigInt(sig.slice(20))
  return [r, s]
}
