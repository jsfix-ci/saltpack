export class EphemeralPublicKey {
 private value: EphemeralPublicKey.Value
 constructor(value:EphemeralPublicKey.Value) {
  this.value = Uint8Array.from(value)
 }

 encode():EphemeralPublicKey.Encoded {
  return this.value
 }
}

export namespace EphemeralPublicKey {
 export type Value = Uint8Array
 // > The ephemeral public key is a NaCl public encryption key, 32 bytes. The
 // > ephemeral keypair is generated at random by the sender and only used for
 // > one message.
 export type Encoded = Uint8Array

 export function decode(encoded:Encoded):EphemeralPublicKey|Error {
  if ( encoded.length === 32 && encoded.constructor === Buffer ) {
   return new EphemeralPublicKey(encoded)
  }
  return Error(EphemeralPublicKey.name + ' failed to decode ' + JSON.stringify(encoded))
 }
}
