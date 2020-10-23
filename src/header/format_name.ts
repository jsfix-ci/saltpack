import * as D from 'io-ts/Decoder'
import * as E from 'io-ts/Encoder'
import * as C from 'io-ts/Codec'

// > The format name is the string "saltpack".
export const enum Value {
 SaltPack = "saltpack"
}

export type Encoded = string

export const decoder: D.Decoder<unknown, Value.SaltPack> = D.literal(Value.SaltPack)
export const encoder: E.Encoder<Encoded, Value> = {
 encode: (v: Value) => Value.SaltPack
}

export const Codec: C.Codec<unknown, Encoded, Value> = C.make(decoder, encoder)
