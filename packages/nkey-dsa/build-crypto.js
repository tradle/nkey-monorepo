#!/usr/bin/env node
const cryptojs = [
  'header.js',
  'core.js',
  'enc-base64.js',
  'cipher-core.js',
  'aes.js',
  'sha1.js',
  'sha256.js',
  'hmac.js',
  'pad-nopadding.js',
  'mode-ctr.js',
  'footer.js'
]

const dir = `${__dirname}/vendor/cryptojs/`
const fs = require('fs/promises')

;(async () => {
  const files = await Promise.all(cryptojs.map(async file => {
    return Buffer.concat([await fs.readFile(`${dir}/${file}`), Buffer.from('\n')])
  }))
  await fs.writeFile(`${__dirname}/vendor/crypto.js`, Buffer.concat(files))
})()
  .catch(err => {
    console.error(err.stack)
    process.exit(1)
  })
