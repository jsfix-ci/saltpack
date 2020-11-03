import * as D from 'io-ts/Decoder'
import * as E from 'io-ts/Encoder'
import * as C from 'io-ts/Codec'

// > The final flag is a boolean, true for the final payload packet, and false
// > for all other payload packets.
export enum Value {
 Final = 0x01,
 NotFinal = 0x00,
}
export type Encoded = number

export const decoder: D.Decoder<unknown, Value> = {
 decode: (a) => {
  if (!!a) {
   return D.success(Value.Final)
  }
  else {
   return D.success(Value.NotFinal)
  }
 }
}

export const encoder: E.Encoder<Encoded, Value> = {
 encode: (v: Value) => {
  switch (v) {
   case Value.Final: return 0x01
   case Value.NotFinal: return 0x00
  }
 }
}

export const Codec: C.Codec<unknown, Encoded, Value> = C.make(decoder, encoder)
