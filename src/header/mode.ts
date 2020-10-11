import { parse as mpParse } from '../messagepack/parse'

export type Value = number

export enum Mode {
 Encryption = 0,
 AttachedSigning = 1,
 DetachedSigning = 2,
 Signcryption = 3,
}

export function value(mode:Mode):Value {
 return mode
}

export function parse(value:Value):Mode|Error {
 return mpParse(
  (value:Value) => { return ( 0 <= value ) && ( value <= 3 ) },
  (value:Value) => {
   switch (value) {
    case 0: return Mode.Encryption
    case 1: return Mode.AttachedSigning
    case 2: return Mode.DetachedSigning
    case 3: return Mode.Signcryption
   }
  },
  value,
  'Mode',
 )
}
