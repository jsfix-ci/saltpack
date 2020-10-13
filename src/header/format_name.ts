import { parse as mpParse } from '../messagepack/parse'

export namespace FormatName {
 const name:string = 'FormatName'
 export type Portable = string
 export enum Value {
  SaltPack = "saltpack"
 }

 export function toPortable(value:Value):Portable {
  return Value.SaltPack
 }

 function guardPortable(portable:Portable):boolean {
  return portable === Value.SaltPack
 }

 function fromPortableUnsafe(portable:Portable):FormatName.Value|void {
  return Value.SaltPack
 }

 export function fromPortable(portable:Portable):FormatName.Value|Error {
  return mpParse(guardPortable, fromPortableUnsafe, portable, name)
 }
}
