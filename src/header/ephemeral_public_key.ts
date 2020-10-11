import { parse as mpParse } from '../messagepack/parse'

export type Value = Uint8Array

export interface EphemeralPublicKey {
 key: Value
}

export function value(ephemeralPublicKey:EphemeralPublicKey):Value {
 return ephemeralPublicKey.key
}

export function parse(value:Value):EphemeralPublicKey|Error {
 return mpParse(
  (value:Value) => { return value.length === 32 },
  (value:Value) => { return { key: Uint8Array.from(value) } },
  value,
  'EphemeralPublicKey',
 )
}
