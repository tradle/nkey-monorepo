export type Callback <T> = (error: Error | null | undefined, data: T) => any;

export interface AnyKey {
  readonly type: string;
  readonly fingerprint: string;
  readonly pubKeyString: string;
  readonly pub: Buffer;
  readonly isPrivateKey: boolean;
  readonly isSignKey: boolean;
  readonly hasDeterministicSig: boolean;
  readonly privKeyString?: string | null;
  toJSON(exportPrivate?: boolean): any;
  set(key: string, value: any): void;
  get(key: string): any;
}

export type PrivateKeyFor <Key extends AnyKey> = Key & {
  readonly privKeyString: string
  readonly isPrivateKey: true
};

export type PublicKeyFor <Key extends AnyKey> = Key & {
  readonly privKeyString?: null
  readonly isPrivateKey: false
};

export type KeyFor <Key extends AnyKey> = PrivateKeyFor<Key> | PublicKeyFor<Key>;
export type PrivateKey = PrivateKeyFor<AnyKey>;
export type PublicKey = PublicKeyFor<AnyKey>;
export type Key = KeyFor<AnyKey>;

export type SignKey <Key = AnyKey> = Key & {
  isSignKey: true
  // async
  sign(data: Buffer, cb: Callback<string>): void
  verify(data: Buffer, signature: string, cb: Callback<boolean>): void
  // sync
  signSync(data: Buffer): string
  verifySync(data: Buffer, signature: string): boolean
};

export interface API <Type extends string = string, Key extends AnyKey = AnyKey, GenOpts extends object = {}> {
  type: Type;
  fromJSON(json: any): KeyFor<Key>;
  gen(opts: GenOpts, cb: Callback<PrivateKeyFor<Key>>): void;
  genSync(opts: GenOpts): PrivateKeyFor<Key>;
  isPrivateKey(key: Key): key is PrivateKeyFor<Key>;
  isPublicKey(key: Key): key is PublicKeyFor<Key>;
  isSignKey(key: Key): key is SignKey<Key>;
  isMyKey(key: AnyKey): key is Key;
}

export type InstancePropAdded = 'set' | 'get' | 'isPrivateKey' | 'isSignKey';
export type InstanceSignPropAdded = InstancePropAdded  | 'sign' | 'verify';

export type AnyRawKey = Omit<AnyKey, InstanceSignPropAdded>;
export type RawPrivateKeyFor <K extends AnyRawKey> = K & {
  privKeyString: string
};
export type RawPublicKeyFor <K extends AnyRawKey> = K & {
  privKeyString?: null
};

export type RawKeyFor <Key extends AnyRawKey> = RawPrivateKeyFor<Key> | RawPublicKeyFor<Key>;

export type SignPropReplaced = 'signSync' | 'verifySync';

export type RawSignKey <Key extends AnyRawKey> = RawKeyFor<Key> & Pick<SignKey, SignPropReplaced>;

export interface RawAPI <Key extends AnyRawKey = AnyRawKey> {
  type: string;
  fromJSON(json: any): RawKeyFor<Key>;
  genSync(): RawPrivateKeyFor<Key>;
}

export type KeyForRawKey <Key extends AnyRawKey> =
  Key extends RawSignKey<AnyRawKey>
    ? SignKey<Omit<Key, SignPropReplaced> & Pick<SignKey, SignPropReplaced | InstanceSignPropAdded>>
    : KeyFor<Key & Pick<AnyKey, InstancePropAdded>>;

export type APIForRawAPI <T extends RawAPI> = T extends RawAPI<infer Key>
  ? Omit<T, 'genSync' | 'fromJSON'> & API<T['type'], KeyForRawKey<Key>>
  : null;

export type Wrapped <T extends AnyRawKey | RawAPI> = T extends RawAPI
  ? APIForRawAPI<T>
  : T extends AnyRawKey
    ? KeyForRawKey<T>
    : null;

export function wrap <T extends AnyRawKey | RawAPI>(obj: T): Wrapped<T>;
export function wrapAPI <T extends RawAPI>(obj: T): APIForRawAPI<T>;
export function wrapInstance <T extends AnyRawKey>(key: T): KeyForRawKey<T>;
export function isPrivateKey <T extends AnyKey>(key: T): key is PrivateKeyFor<T>;
export function isPublicKey <T extends AnyKey>(key: T): key is PublicKeyFor<T>;
export function isSignKey <T extends AnyKey>(key: T): key is SignKey<T>;
