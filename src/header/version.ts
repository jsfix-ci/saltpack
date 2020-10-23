import * as D from 'io-ts/Decoder'
import * as E from 'io-ts/Encoder'
import * as C from 'io-ts/Codec'
import { pipe } from 'fp-ts/lib/pipeable'

// > The version is a list of the major and minor versions, currently [2, 0],
// > both encoded as positive fixnums.
export enum Value {
 One,
 Two,
}

export type Encoded = [ number, number ]

const decoder: D.Decoder<unknown, Value> = pipe(
 D.array(D.number),
 D.refine((a): a is Array<number> => a.length === 2, 'Length'),
 D.parse(a => {
  let [ major, minor ] = a
  if ( minor === 0 ) {
   switch ( major ) {
    case 1: return D.success(Value.One)
    case 2: return D.success(Value.Two)
   }
  }
  return D.failure(a, 'Version')
 })
)

const encoder: E.Encoder<Encoded, Value> = {
 encode: (v: Value) => {
  switch (v) {
   case Value.One: return [ 1, 0 ]
   case Value.Two: return [ 2, 0 ]
  }
 }
}

export const Codec: C.Codec<unknown, Encoded, Value> = C.make(decoder, encoder)
