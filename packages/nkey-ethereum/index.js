
const nkey = require('nkey')
const Wallet = require('@tradle/ethereumjs-wallet')
const type = 'ethereum'
const curve = 'secp256k1'
const UNCOMPRESSED_PREFIX = Buffer.from('04', 'hex')

const impl = nkey.wrapAPI({
  type,
  genSync,
  fromJSON
})

module.exports = impl

function genSync (opts) {
  const wallet = Wallet.generate(opts.icapDirect)
  return impl.fromJSON({
    networkName: opts.networkName,
    priv: wallet.privKey,
    pub: Buffer.concat([UNCOMPRESSED_PREFIX, wallet.pubKey]),
    fingerprint: unprefixHex(wallet.getAddressString())
  })
}

function fromJSON (json) {
  const priv = json.priv ? toHexBuffer(json.priv) : null
  const pub = toHexBuffer(json.pub)
  const privKeyString = toHexString(json.priv)
  const pubKeyString = toHexString(json.pub)
  const fingerprint = json.fingerprint
  return nkey.wrapInstance({
    type,
    pub,
    priv,
    privKeyString,
    pubKeyString,
    hasDeterministicSig: false,
    fingerprint,
    toJSON: function toJSON (exportPrivate) {
      const obj = {
        type,
        curve,
        pub: pubKeyString,
        fingerprint,
        networkName: json.networkName
      }

      if (exportPrivate) obj.priv = privKeyString

      return obj
    }
  })
}

function toHexBuffer (val) {
  return Buffer.isBuffer(val) ? val : Buffer.from(val, 'hex')
}

function toHexString (val) {
  return Buffer.isBuffer(val) ? val.toString('hex') : val
}

function unprefixHex (val) {
  return val.slice(0, 2) === '0x' ? val.slice(2) : val
}
