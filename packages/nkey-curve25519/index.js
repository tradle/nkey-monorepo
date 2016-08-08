'use strict'

const crypto = require('crypto')
const curve25519 = require('tweetnacl').box
const nkey = require('nkey')
const type = 'ec'

const impl = nkey.wrap({
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
    ? new Buffer(opts.priv, 'hex') :
    opts.priv && opts.priv.secretKey ? new Buffer(opts.priv.secretKey) : opts.priv

  const privArr = priv && toUint8Array(priv)
  const pub = typeof opts.pub === 'string'
    ? new Buffer(opts.pub, 'hex')
    : opts.pub || (opts.priv && opts.priv.publicKey && new Buffer(opts.priv.publicKey)) || pubFromPriv(priv)

  const privEnc = typeof priv === 'string' && 'hex'
  const pubEnc = typeof pub === 'string' && 'hex'
  const pubKeyString = pub.toString('hex')
  const privKeyString = priv && priv.toString('hex')
  const fingerprint = crypto.createHash('sha256').update(pub).digest('hex')

  return nkey.wrap({
    type,
    pubKeyString,
    fingerprint,
    pub,
    priv,
    ecdh: function (pub) {
      if (!priv) throw new Error('this is a public key!')

      pub = toUint8Array(pub)
      const sharedKey = curve25519.before(pub, privArr)
      return new Buffer(sharedKey)
    },
    toJSON
  })

  function pubFromPriv (priv) {
    const arr = priv.secretKey || curve25519.keyPair.fromSecretKey(priv).publicKey
    return new Buffer(arr)
  }

  function toJSON (exportPrivate) {
    const obj = {
      type: 'ec',
      curve: 'curve25519',
      pub: pubKeyString,
      fingerprint
    }

    if (exportPrivate) obj.priv = privKeyString

    return obj
  }
}

function toUint8Array (buf) {
  if (buf instanceof Uint8Array) return buf
  if (!Buffer.isBuffer(buf)) {
    throw new Error('expected Buffer or Uint8Array')
  }

  var arr = new Uint8Array(buf.length)
  for (var i = 0; i < buf.length; i++) {
    arr[i] = buf[i]
  }

  return arr
}
