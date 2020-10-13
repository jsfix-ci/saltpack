import { parse as mpParse } from '../messagepack/parse'

export namespace Mode {
 const name:string = 'Mode'
 // > The mode is the number 0, for encryption, encoded as a positive fixnum.
 // > (1 and 2 are attached and detached signing, and 3 is signcryption.)
 export type Portable = number
 export enum Value {
  Encryption = 0,
  AttachedSigning = 1,
  DetachedSigning = 2,
  Signcryption = 3,
 }

 export function toPortable(value:Value):Portable {
  return value
 }

 function guardPortable(portable:Portable):boolean {
  return ( 0 <= portable ) && ( portable <= 3 )
 }

 function fromPortableUnsafe(portable:Portable):Mode.Value|void {
  switch (portable) {
   case 0: return Value.Encryption
   case 1: return Value.AttachedSigning
   case 2: return Value.DetachedSigning
   case 3: return Value.Signcryption
  }
 }

 export function fromPortable(portable:Portable):Mode.Value|Error {
  return mpParse(guardPortable, fromPortableUnsafe, portable, name)
 }
}
