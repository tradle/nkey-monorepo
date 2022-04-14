'use strict'

const crypto = require('crypto')
const secp256k1 = require('secp256k1')
const nkey = require('nkey')
const type = 'secp256k1'

const impl = nkey.wrapAPI({
  type,
  genSync,
  fromJSON
})

module.exports = impl

function genSync () {
  let priv
  do {
    priv = crypto.randomBytes(32)
  } while (!secp256k1.privateKeyVerify(priv))

  return createKey({
    priv,
    pub: secp256k1.publicKeyCreate(priv)
  })
}

function fromJSON (opts) {
  if (!(opts.priv || opts.pub)) {
    throw new Error('expected "priv" or "pub"')
  }
  return createKey({
    ...opts,
    pub: typeof opts.pub === 'string' ? Buffer.from(opts.pub, 'hex') : opts.pub,
    priv: opts.priv && secp256k1.privateKeyImport(Buffer.from(opts.priv, 'hex'))
  })
}

function createKey (opts) {
  const priv = opts.priv
  const pub = opts.pub
  const privKeyString = priv && secp256k1.privateKeyExport(priv).toString('hex')
  const pubKeyString = pub.toString('hex')
  const fingerprint = crypto.createHash('sha256').update(pub).digest('hex')

  return nkey.wrapInstance({
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
    if (!priv) throw new Error('this is a public key')

    let sig = secp256k1.sign(msg, priv)

    // Ensure low S value
    sig = secp256k1.signatureNormalize(sig.signature)

    // Convert to DER array
    return Buffer.from(secp256k1.signatureExport(sig)).toString('hex')
  }

  function verifySync (msg, sig) {
    if (typeof sig === 'string') sig = Buffer.from(sig, 'hex')

    sig = secp256k1.signatureImport(sig)
    return secp256k1.verify(msg, sig, pub)
  }

  function toJSON (exportPrivate) {
    const obj = {
      type: type,
      pub: pubKeyString,
      fingerprint
    }

    if (exportPrivate) obj.priv = privKeyString

    return obj
  }
}
