import * as D from 'io-ts/Decoder'
import * as E from 'io-ts/Encoder'
import * as C from 'io-ts/Codec'

export type Value = Uint8Array
export type Encoded = Uint8Array

export const decoder: D.Decoder<unknown, Value> = {
  decode: (a) => {
    if (a instanceof Uint8Array) {
      return D.success(a)
    }
    if (a instanceof Buffer) {
      return D.success(Uint8Array.from(a))
    }
    return D.failure(a, JSON.stringify(a) + ' cannot be decoded as a Uint8Array')
  }
}

export const encoder: E.Encoder<Encoded, Value> = {
  encode: (v: Value) => Uint8Array.from(v)
}

export const Codec: C.Codec<unknown, Encoded, Value> = C.make(decoder, encoder)
