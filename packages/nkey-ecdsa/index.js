'use strict'

const crypto = require('crypto')
const { KeyEncoder } = require('@tradle/key-encoder')
const nkey = require('nkey')
const special = {
  secp256k1: require('nkey-secp256k1')
}

const curves = {
  p192: 'prime192v1',
  p256: 'prime256v1',
  p384: 'secp384r1',
  p521: 'secp521r1'
}

const availableCurves = new Set(crypto.getCurves())
function createECDH (curve) {
  curve = curves[curve] || curve
  if (!availableCurves.has(curve)) {
    throw new Error(`curve [${curve}] is not supported by native crypt supported, supported curves are ${Array.from(availableCurves).toString(',')}`)
  }
  return crypto.createECDH(curve)
}

const type = 'ecdsa'

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
    return wrap(getImpl(opts).genSync(opts), opts)
  },
  fromJSON: function (json) {
    json = normalizeOpts(json)
    return wrap(getImpl(json).fromJSON(json), json)
  }
})

exports.DEFAULT_ALGORITHM = 'sha256'
exports.DEFAULT_CURVE = 'secp256k1'
exports.setImplementationForCurve = function (curve, impl) {
  special[curve] = impl
}

function normalizeOpts (opts) {
  opts = opts || {}
  const copy = {}
  for (var p in opts) copy[p] = opts[p]

  if (!copy.curve) copy.curve = exports.DEFAULT_CURVE

  return copy
}

function genSync (opts) {
  const curve = opts.curve
  const ec = createECDH(curve)
  ec.generateKeys()
  return impl.fromJSON({
    curve: curve,
    priv: ec.getPrivateKey()
  })
}

function fromJSON (opts) {
  if (!(opts.priv || opts.pub)) {
    throw new Error('expected "priv" or "pub"')
  }

  if (!opts.curve) throw new Error('expected "curve"')

  const curve = opts.curve
  const ec = createECDH(curve)
  const priv = typeof opts.priv === 'string' ? Buffer.from(opts.priv, 'hex') : opts.priv
  if (priv) ec.setPrivateKey(priv)

  let pub = typeof opts.pub === 'string' ? Buffer.from(opts.pub, 'hex') : opts.pub
  if (!pub) pub = ec.getPublicKey()

  const pubKeyString = pub.toString('hex')
  const fingerprint = crypto.createHash('sha256').update(pub).digest('hex')
  const encoder = new KeyEncoder(curve)
  let privPEM
  let pubPEM

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

  function getEncodedPriv () {
    return privPEM || (privPEM = encoder.encodePrivate(priv, 'raw', 'pem'))
  }

  function getEncodedPub () {
    return pubPEM || (pubPEM = encoder.encodePublic(pub, 'raw', 'pem'))
  }

  function signSync (data, algorithm) {
    let priv = getEncodedPriv()
    algorithm = algorithm || exports.DEFAULT_ALGORITHM
    return crypto.createSign(algorithm).update(data).sign(priv, 'hex')
  }

  function verifySync (data, algorithm, sig) {
    let pub = getEncodedPub()
    if (typeof sig === 'undefined') {
      sig = algorithm
      algorithm = exports.DEFAULT_ALGORITHM
    }

    if (typeof sig === 'string') sig = Buffer.from(sig, 'hex')

    return crypto.createVerify(algorithm).update(data).verify(pub, sig)
  }

  function toJSON (exportPrivateKey) {
    const obj = {
      type,
      curve,
      pub: pubKeyString,
      fingerprint
    }

    if (exportPrivateKey) obj.priv = priv.toString('hex')

    return obj
  }
}
