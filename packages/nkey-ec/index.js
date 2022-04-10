'use strict'

const crypto = require('crypto')
const inherits = require('util').inherits
const EC = require('elliptic').ec
const extend = require('xtend')
const nkey = require('nkey')
const special = {
  secp256k1: require('nkey-secp256k1'),
  curve25519: require('nkey-curve25519')
}

const PUB_PROPS = ['curve', 'pub']
const curves = {}
const type = 'ec'

const impl = nkey.wrap({
  type,
  gen,
  genSync,
  fromJSON
})

function getImpl (opts) {
  return special[opts.curve] || impl
}

module.exports = exports = nkey.wrap({
  gen: function (opts, cb) {
    opts = normalizeOpts(opts)
    return getImpl(opts).gen(opts, cb)
  },
  genSync: function (opts) {
    opts = normalizeOpts(opts)
    return getImpl(opts).genSync(opts)
  },
  fromJSON: function (json) {
    json = normalizeOpts(json)
    return getImpl(json).fromJSON(json)
  }
})

exports.DEFAULT_CURVE = 'ed25519'

function normalizeOpts (opts) {
  opts = opts || {}
  const copy = {}
  for (var p in opts) copy[p] = opts[p]

  if (!copy.curve) copy.curve = exports.DEFAULT_CURVE

  return copy
}

function genSync (opts) {
  const curve = opts.curve
  return impl.fromJSON({
    curve: curve,
    priv: getCurve(curve).genKeyPair()
  })
}

function gen (opts, cb) {
  process.nextTick(() => cb(null, genSync(opts)))
}

function fromJSON (opts) {
  if (!(opts.priv || opts.pub)) {
    throw new Error('expected "priv" or "pub"')
  }

  if (!opts.curve) throw new Error('expected "curve"')

  const curve = opts.curve
  const ec = getCurve(curve)
  const priv = typeof opts.priv === 'string' ? Buffer.from(opts.priv, 'hex') : opts.priv
  let pub = typeof opts.pub === 'string' ? Buffer.from(opts.pub, 'hex') : opts.pub
  const key = priv ? ec.keyFromPrivate(priv) : ec.keyFromPublic(pub)
  if (!pub) pub = Buffer.from(key.getPublic(true, 'buffer'))

  const pubKeyString = pub.toString('hex')
  const fingerprint = crypto.createHash('sha256').update(pub).digest('hex')

  return nkey.wrap({
    type,
    signSync,
    verifySync,
    hasDeterministicSig: true,
    pubKeyString,
    fingerprint,
    pub,
    priv,
    toJSON
  })

  function signSync (data) {
    return Buffer.from(key.sign(data).toDER()).toString('hex')
  }

  function verifySync (data, sig) {
    if (typeof sig === 'string') sig = Buffer.from(sig, 'hex')
    return key.verify(data, sig)
  }

  function toJSON (exportPrivateKey) {
    const obj = {
      type,
      curve,
      pub: pubKeyString,
      fingerprint
    }

    if (exportPrivateKey) obj.priv = key.getPrivate('hex')

    return obj
  }
}

function getCurve (name) {
  if (!curves[name]) curves[name] = new EC(name)

  return curves[name]
}
