import * as D from 'io-ts/Decoder'
import * as E from 'io-ts/Encoder'
import * as C from 'io-ts/Codec'
import { pipe } from 'fp-ts/lib/pipeable'
import * as Bytes from './bytes'

export type Value = Bytes.Value
export type Encoded = Bytes.Encoded

export const decoderBuilder = (n:number) =>
 pipe(
  Bytes.decoder,
  D.refine((input): input is Encoded => input.length === n, `length must be exactly ${n}`),
 )

export const encoder: E.Encoder<Encoded, Value> = Bytes.encoder
