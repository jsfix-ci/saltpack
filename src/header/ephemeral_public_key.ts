import { parse as mpParse } from '../messagepack/parse'

export namespace EphemeralPublicKey {
 const name:string = 'EphemeralPublicKey'
 // > The ephemeral public key is a NaCl public encryption key, 32 bytes. The
 // > ephemeral keypair is generated at random by the sender and only used for
 // > one message.
 export type Portable = Uint8Array
 export interface Value {
  key: Portable
 }

 export function toPortable(value:Value):Portable {
  return value.key
 }

 function guardPortable(portable:Portable):boolean {
  return portable.length === 32
 }

 function fromPortableUnsafe(portable:Portable):EphemeralPublicKey.Value|void {
  return { key: Uint8Array.from(portable) }
 }

 export function fromPortable(portable:Portable):EphemeralPublicKey.Value|Error {
  return mpParse(guardPortable, fromPortableUnsafe, portable, name)
 }
}
