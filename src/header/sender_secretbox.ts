import { parse as mpParse } from '../messagepack/parse'

export namespace SenderSecretBox {
 const name:string = 'SenderSecretBox'
 export type Portable = Uint8Array
 export interface Value {
  secretBox: Portable
 }

 export function toPortable(value:Value):Portable {
  return value.secretBox
 }

 function guardPortable(portable:Portable):boolean {
  // the Uint8Array is represented as a Buffer by messagepack round tripping so
  // we have to fit that to our Uint8Array model
  return portable.constructor === Buffer
 }

 function fromPortableUnsafe(portable:Portable):SenderSecretBox.Value|void {
  return { secretBox: Uint8Array.from(portable) }
 }

 export function fromPortable(portable:Portable):SenderSecretBox.Value|Error {
  return mpParse(guardPortable, fromPortableUnsafe, portable, name)
 }
}
