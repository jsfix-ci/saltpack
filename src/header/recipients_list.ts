import { parse as mpParse } from '../messagepack/parse'

export namespace RecipientPublicKey {
 const name:string = 'RecipientPublicKey'
 // > The recipient public key is the recipient's long-term NaCl public
 // > encryption key. This field may be null, when the recipients are anonymous.
 export type Portable = null|Uint8Array
 export interface Value {
  maybe_key: Portable
 }

 export function toPortable(value:Value):Portable {
  return value.maybe_key
 }

 export function guardPortable(portable:Portable):boolean {
  return ( portable === null ) || ( portable!.constructor === Buffer && portable!.length === 32 )
 }

 export function fromPortableUnsafe(portable:Portable):RecipientPublicKey.Value|void {
  return { maybe_key: portable === null ? portable : Uint8Array.from(portable) }
 }

 export function fromPortable(portable:Portable):RecipientPublicKey.Value|Error {
  return mpParse(guardPortable, fromPortableUnsafe, portable, name)
 }
}

export namespace PayloadKeyBox {
 const name:string = 'PayloadKeyBox'
 // > The payload key box is a crypto_box containing a copy of the payload key,
 // > encrypted with the recipient's public key, the ephemeral private key, and
 // > a counter nonce.
 export type Portable = Uint8Array
 export interface Value {
  box: Portable
 }

 export function toPortable(value:Value):Portable {
  return value.box
 }

 function guardPortable(portable:Portable):boolean {
  // the Uint8Array is represented as a Buffer by messagepack round tripping so
  // we have to fit that to our Uint8Array model
  return portable.constructor === Buffer
 }

 export function fromPortableUnsafe(portable:Portable):PayloadKeyBox.Value|void {
  return { box: Uint8Array.from(portable) }
 }

 export function fromPortable(portable:Portable):PayloadKeyBox.Value|Error {
  return mpParse(guardPortable, fromPortableUnsafe, portable, name)
 }
}

export namespace RecipientsList {
 const name:string = 'RecipientsList'
 // > The recipients list contains a recipient pair for each recipient key,
 // > including an encrypted copy of the payload key (see below). Note that a
 // > MessagePack array can hold at most at most 2³² − 1 elements, so therefore
 // > an encrypted message can have at most 2³² − 1 recipients.
 export type Portable = Array<[ RecipientPublicKey.Portable, PayloadKeyBox.Portable ]>
 export type Value = Array<[ RecipientPublicKey.Value, PayloadKeyBox.Value ]>

 export function toPortable(value:Value):Portable {
  return value.map((item:[ RecipientPublicKey.Value, PayloadKeyBox.Value ]) => { return [ RecipientPublicKey.toPortable(item[0]), PayloadKeyBox.toPortable(item[1]) ] })
 }

 function guardPortable(portable:Portable):boolean {
  let valid = true
  for (let [ recipient_public_key, payload_key_box ] of portable) {
   if (!valid) {
    break
   }
   valid = valid && RecipientPublicKey.guardPortable(recipient_public_key) && RecipientPublicKey.guardPortable(payload_key_box)
  }
  return valid
 }

 function fromPortableUnguarded(portable:Portable):RecipientsList.Value|Error {
  let arr:RecipientsList.Value = []
  for (let [ recipient_public_key, payload_key_box ] of portable) {
   let recipient_public_key_portable = RecipientPublicKey.fromPortable(recipient_public_key)
   if (recipient_public_key_portable instanceof Error) {
    return recipient_public_key_portable
   }

   let payload_key_box_portable = PayloadKeyBox.fromPortable(payload_key_box)
   if (payload_key_box_portable instanceof Error) {
    return payload_key_box_portable
   }

   arr.push([recipient_public_key_portable, payload_key_box_portable])
  }
  return arr
 }

 export function fromPortable(portable:Portable):RecipientsList.Value|Error {
  return mpParse(guardPortable, fromPortableUnguarded, portable, name)
 }
}
