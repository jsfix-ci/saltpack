import { encode, decode } from '@msgpack/msgpack'
import * as D from 'io-ts/Decoder'
import * as E from 'io-ts/Encoder'
import * as C from 'io-ts/Codec'
import { pipe } from 'fp-ts/lib/pipeable'
import * as Bytes from '../bytes/bytes'

export type Value = unknown
export type Encoded = Uint8Array

const decoder: D.Decoder<unknown, Value> = pipe(
 Bytes.decoder,
 D.parse(a => {
  try {
   return D.success(decode(a))
  } catch (e) {
   return D.failure(a, JSON.stringify(e))
  }
 })
)

const encoder: E.Encoder<Encoded, Value> = {
 encode: (v: Value) => encode(v)
}

export const Codec: C.Codec<unknown, Encoded, Value> = C.make(decoder, encoder)
