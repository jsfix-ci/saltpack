import * as D from 'io-ts/Decoder'
import { pipe } from "fp-ts/lib/pipeable"

export type Value = Uint8Array
export type Encoded = Uint8Array

export const Uint8ArrayDecoder: D.Decoder<unknown, Value> = {
 decode: (a: unknown) => {
  try {
   return D.success(Uint8Array.from(a))
  } catch (e) {
   return D.failure(a, JSON.stringify(e))
  }
 }
}

export const Uint8ArrayEncoder: E.Encoder<Encoded, Value> = {
 encode: (v: Value) => {
  try {
   return D.success(Uint8Array.from(v))
  } catch (e) {
   return D.failure(v, JSON.stringify(e))
  }
 }
}

export const FixedSizeUint8ArrayDecoderBuilder = (n: number) => pipe(
 Uint8ArrayDecoder,
 D.refine((input): input is Uint8Array => input.length === n, `length must be exactly #{n}`),
)
