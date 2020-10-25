export const length = 64

export type Value = Sized.Value
export type Encoded = Sized.Encoded

export const decoder: typeof Bytes.decoder = Sized.decoderBuilder(length)
export const encoder = Sized.encoder

export const Codec: C.Codec<unknown, Encoded, Value> = C.make(decoder, encoder)
