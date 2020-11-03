// > The final flag is a boolean, true for the final payload packet, and false
// > for all other payload packets.
export enum Value {
 Final = 0x01,
 NotFinal = 0x00,
}
export type Encoded = boolean

export const decoder: D.Decoder<unknown, Value> = D.boolean

export const encoder: E.Encoder<Encoded, Value> = E.boolean

export const Codec: C.Codec<unknown, Encoded, Value> = C.make(decoder, encoder)
