import * as D from 'io-ts/Decoder'
import * as E from 'io-ts/Encoder'
import * as C from 'io-ts/Codec'
import { pipe } from 'fp-ts/lib/pipeable'

// > The mode is the number 0, for encryption, encoded as a positive fixnum.
// > (1 and 2 are attached and detached signing, and 3 is signcryption.)
export enum Value {
 Encryption = 0,
 AttachedSigning = 1,
 DetachedSigning = 2,
 Signcryption = 3,
}

export type Encoded = number

export const decoder: D.Decoder<unknown, Value> = pipe(
 D.number,
 D.parse(a => {
  if (Value[a]) {
   return D.success(a)
  }
  return D.failure(a, 'Mode')
 }),
)

export const encoder: E.Encoder<Encoded, Value> = {
 encode: (v: Value) => v
}

export const Codec: C.Codec<unknown, Encoded, Value> = C.make(decoder, encoder)
