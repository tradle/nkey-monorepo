# `nkey-testsuite`

> [tape][] Runs the [nkey][] testsuite for a given implementation.

[tape]: https://npmjs.com/package/tape
[nkey]: https://npmjs.com/package/nkey

## Usage

1. Add `nkey-testsuite` to the dev dependencies
2. Create a `test.js` file like below
3. Run the `test.js` file using `node test.js`
4. Prosper!

```js
// Straight forward implementation
require('nkey-testsuite')(require('.'))

// Integrated use
const tape = require('tape')
tape('suite', t => {
  // With the "t" option the tests get run as subtests
  require('nkey-testsuite')(require('.'), { t })
})

// Add variant flag to distinguish between implementations
require('nkey-testsuite')(require('./a'), { variant: 'a' })
require('nkey-testsuite')(require('./b'), { variant: 'b' })

// Get informed about the ned
require('nkey-testsuite')(require('.'), () => {
  console.log('done!')
})
```

## License

[MIT][./LICENSE]
