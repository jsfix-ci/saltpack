// > The sender secretbox is a crypto_secretbox containing the sender's
// > long-term public key, encrypted with the payload key from below.
export class SenderSecretBox {
 private value: SenderSecretBox.Value
 constructor(value:SenderSecretBox.Value) {
  this.value = Uint8Array.from(value)
 }

 encode():SenderSecretBox.Encoded {
  return this.value
 }
}

export namespace SenderSecretBox {
 export type Encoded = Uint8Array
 export type Value = Uint8Array

 export function decode(encoded:Encoded):SenderSecretBox|Error {
  if (encoded.length === 32 && encoded.constructor === Buffer ) {
   return new SenderSecretBox(encoded)
  }
  return Error(SenderSecretBox.name + ' failed to decode ' + JSON.stringify(encoded))
 }
}
