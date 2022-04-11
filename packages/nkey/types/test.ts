import { wrap, wrapInstance, isPrivateKey, isPublicKey, API, PrivateKey, Key, PublicKey, isSignKey, SignKey, AnyKey, KeyFor } from 'nkey';

type CustomType = 'test';
type CustomKey = KeyFor<SignKey & {
  type: CustomType
  customKey: string
}>;
interface CustomOpts {
  foo: 'string';
}
type CustomAPI = API<CustomType, CustomKey, CustomOpts> & {
  customFunction(foo: string): number
};

const api: CustomAPI = wrap({} as any);

const anyKey: AnyKey = {} as unknown as AnyKey;

if (api.isMyKey(anyKey)) {
  anyKey.customKey; // $ExpectType string
}

api.customFunction('hello'); // $ExpectType number
const keyA = api.genSync({
  foo: 'string'
});
keyA.customKey; // $ExpectType string

if (api.isPrivateKey(keyA)) {
  keyA.isPrivateKey; // $ExpectType true
  keyA.privKeyString; // $ExpectType string
}
if (api.isPublicKey(keyA)) {
  // Note: this is "never" because the key has been created before!
  keyA; // $ExpectType never
}
if (api.isSignKey(keyA)) {
  keyA.isSignKey; // $ExpectType true
}

const keyApublic = api.fromJSON(keyA.toJSON());

if (api.isPublicKey(keyApublic)) {
  keyApublic.isPrivateKey; // $ExpectType false
  keyApublic.privKeyString; // $ExpectType null | undefined
}

api.type; // $ExpectType "test"

const standard: API = api;
standard.type; // $ExpectType string
const standardKey: PrivateKey = standard.genSync({});
const standardAnyKey: Key = standard.fromJSON(standardKey.toJSON(true));
if (standard.isPrivateKey(standardAnyKey)) {
  const standardPriv: PrivateKey = standardAnyKey;
}
if (standard.isPublicKey(standardAnyKey)) {
  const standardPub: PublicKey = standardAnyKey;
}
if (standard.isSignKey(standardAnyKey)) {
  const standardSign: SignKey = standardAnyKey;
}

const key = wrapInstance({
  pubKeyString: 'hi',
  pub: Buffer.alloc(1),
  fingerprint: 'hi',
  hasDeterministicSig: true,
  type: 'test',
  toJSON(exportPrivate) {
    return {};
  },
  foo: 'bar'
});

key.foo; // @ExpectType string

if (isPrivateKey(key)) {
  key.privKeyString; // $ExpectType string
  key.isPrivateKey; // $$ExpectType true
}

if (isPublicKey(key)) {
  key.privKeyString; // $ExpectType null | undefined
  key.isPrivateKey; // $ExpectType false
}

if (isSignKey(key)) {
  key.signSync(Buffer.alloc(0)); // $ExpectType string
  key.sign(Buffer.alloc(0), (error, data: string) => {
    if (error) {
      error; // $ExpectType Error
    }
    data; // $ExpectType string
  });
  key.verifySync(Buffer.alloc(0), ''); // $ExpectType boolean
  key.verify(Buffer.alloc(0), '', (error, verified) => {
    if (error) {
      error; // $ExpectTypeError
    }
    verified; // $Expecttype boolean
  });
}
