'use strict'

const crypto = require('crypto')
const curve25519 = require('tweetnacl').box
const nkey = require('nkey')
const type = 'curve25519'

const impl = nkey.wrapAPI({
  type,
  genSync,
  fromJSON
})

module.exports = impl

function genSync () {
  const priv = curve25519.keyPair()
  return impl.fromJSON({ priv })
}

function fromJSON (opts) {
  if (!(opts.priv || opts.pub)) {
    throw new Error('expected "priv" or "pub"')
  }

  const priv = typeof opts.priv === 'string'
    ? Buffer.from(opts.priv, 'hex') :
    opts.priv && opts.priv.secretKey ? Buffer.from(opts.priv.secretKey) : opts.priv

  const privArr = priv && toUint8Array(priv)
  const pub = typeof opts.pub === 'string'
    ? Buffer.from(opts.pub, 'hex')
    : opts.pub || (opts.priv && opts.priv.publicKey && Buffer.from(opts.priv.publicKey)) || pubFromPriv(priv)

  const pubKeyString = pub.toString('hex')
  const privKeyString = priv && priv.toString('hex')
  const fingerprint = crypto.createHash('sha256').update(pub).digest('hex')

  return nkey.wrapInstance({
    type,
    privKeyString,
    pubKeyString,
    fingerprint,
    hasDeterministicSig: false,
    pub,
    priv,
    ecdh: function (pub) {
      if (!priv) throw new Error('this is a public key!')

      pub = toUint8Array(pub)
      const sharedKey = curve25519.before(pub, privArr)
      return Buffer.from(sharedKey)
    },
    toJSON
  })

  function pubFromPriv (priv) {
    const arr = priv.secretKey || curve25519.keyPair.fromSecretKey(priv).publicKey
    return Buffer.from(arr)
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

function toUint8Array (buf) {
  if (buf instanceof Uint8Array) return buf
  throw new Error('expected Buffer or Uint8Array')
}
