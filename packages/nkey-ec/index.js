'use strict'

const crypto = require('crypto')
const EC = require('elliptic').ec
const nkey = require('nkey')
const special = {
  secp256k1: require('nkey-secp256k1'),
  curve25519: require('nkey-curve25519')
}

const curves = {}
const type = 'ec'

const impl = nkey.wrapAPI({
  type,
  genSync,
  fromJSON
})

function getImpl (opts) {
  return special[opts.curve] || impl
}

function wrap (key, opts) {
  const res =  Object.freeze({
    ...key,
    type: type,
    curve: opts.curve,
    toJSON (exportPrivate) {
      const json = key.toJSON(exportPrivate)
      json.type = type
      json.curve = opts.curve
      return json
    }
  })
  return res
}

module.exports = exports = nkey.wrapAPI({
  type,
  genSync: function (opts) {
    opts = normalizeOpts(opts)
    const key = getImpl(opts).genSync(opts)
    return wrap(key, opts)
  },
  fromJSON: function (json) {
    json = normalizeOpts(json)
    const key = getImpl(json).fromJSON(json)
    return wrap(key, json)
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

function fromJSON (opts) {
  if (!(opts.priv || opts.pub)) {
    throw new Error('expected "priv" or "pub"')
  }

  const curve = opts.curve
  const ec = getCurve(curve)
  const priv = typeof opts.priv === 'string' ? Buffer.from(opts.priv, 'hex') : opts.priv
  let pub = typeof opts.pub === 'string' ? Buffer.from(opts.pub, 'hex') : opts.pub
  const key = priv ? ec.keyFromPrivate(priv) : ec.keyFromPublic(pub)
  if (!pub) pub = Buffer.from(key.getPublic(true, 'buffer'))

  const pubKeyString = pub.toString('hex')
  const fingerprint = crypto.createHash('sha256').update(pub).digest('hex')

  return nkey.wrapInstance({
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
