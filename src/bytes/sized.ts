import * as D from 'io-ts/Decoder'
import * as E from 'io-ts/Encoder'
import { pipe } from 'fp-ts/lib/pipeable'
import * as Bytes from './bytes'

export type Value = Bytes.Value
export type Encoded = Bytes.Encoded

// Builds a decoder for a fixed length of bytes.
// The byte length is fixed at the time the decoder is built.
export const decoderBuilder = (n:number) =>
  pipe(
    Bytes.decoder,
    D.refine((input): input is Encoded => input.length === n, `length must be exactly ${n}`)
  )

export const encoder: E.Encoder<Encoded, Value> = Bytes.encoder
