// > The recipient public key is the recipient's long-term NaCl public
// > encryption key. This field may be null, when the recipients are anonymous.
export class RecipientPublicKey {
 private value: RecipientPublicKey.Value
 constructor(value:RecipientPublicKey.Value) {
  if (value === null ) {
   this.value = value
  }
  else {
   this.value = Uint8Array.from(value)
  }
 }

 encode():RecipientPublicKey.Encoded {
  return this.value
 }
}

export namespace RecipientPublicKey {
 export type Encoded = null|Uint8Array
 export type Value = null|Uint8Array

 export function decode(encoded:Encoded):RecipientPublicKey|Error {
  if (encoded === null) {
   return new RecipientPublicKey(encoded)
  }
  if (encoded!.constructor === Buffer && encoded!.length === 32 ) {
   return new RecipientPublicKey(encoded)
  }
  return Error(RecipientPublicKey.name + ' failed to decode ' + JSON.stringify(encoded))
 }
}

// > The payload key box is a crypto_box containing a copy of the payload key,
// > encrypted with the recipient's public key, the ephemeral private key, and
// > a counter nonce.
export class PayloadKeyBox {
 private value: PayloadKeyBox.Value
 constructor(value:PayloadKeyBox.Value) {
  this.value = Uint8Array.from(value)
 }

 encode():PayloadKeyBox.Encoded {
  return this.value
 }
}

export namespace PayloadKeyBox {
 export type Encoded = Uint8Array
 export type Value = Uint8Array

 export function decode(encoded:Encoded):PayloadKeyBox|Error {
  if ( encoded.constructor === Buffer ) {
   return new PayloadKeyBox(encoded)
  }
  return Error(PayloadKeyBox.name + ' failed to decode ' + JSON.stringify(encoded))
 }
}

// > The recipients list contains a recipient pair for each recipient key,
// > including an encrypted copy of the payload key (see below). Note that a
// > MessagePack array can hold at most at most 2³² − 1 elements, so therefore
// > an encrypted message can have at most 2³² − 1 recipients.
export class RecipientsList {
 private value: RecipientsList.Value
 constructor(value:RecipientsList.Value) {
  this.value = value
 }

 encode():RecipientsList.Encoded {
  return this.value.map((item: [ RecipientPublicKey, PayloadKeyBox ]) => { return [ item[0].encode(), item[1].encode() ] })
 }
}

export namespace RecipientsList {
 export type Encoded = Array<[ RecipientPublicKey.Encoded, PayloadKeyBox.Encoded ]>
 export type Value = Array<[ RecipientPublicKey, PayloadKeyBox ]>

 export function decode(encoded:Encoded):RecipientsList|Error {
  let arr:RecipientsList.Value = []
  for (let [ recipient_public_key_encoded, payload_key_box_encoded ] of encoded) {
   let recipient_public_key = RecipientPublicKey.decode(recipient_public_key_encoded)
   if (recipient_public_key instanceof Error) {
    return recipient_public_key
   }

   let payload_key_box = PayloadKeyBox.decode(payload_key_box_encoded)
   if (payload_key_box instanceof Error) {
    return payload_key_box
   }

   arr.push([recipient_public_key, payload_key_box])
  }
  return new RecipientsList(arr)
 }
}
