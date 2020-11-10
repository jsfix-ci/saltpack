import * as Encrypt from './encrypt'
import * as BoxKeyPair from '../ed25519/box_keypair'
import * as BoxKeyPairFixture from '../ed25519/box_keypair.fixture'
import * as RecipientPublicKey from '../header/recipient_public_key'
import { strict as assert } from 'assert'

describe('Encrypt', () => {
 describe('build', () => {

  it('should round trip', function () {

   this.timeout(0)

   let senderKeyPair: BoxKeyPair.Value = BoxKeyPairFixture.alice
   let bob: BoxKeyPair.Value = BoxKeyPair.generate()
   let carol: BoxKeyPair.Value = BoxKeyPair.generate()
   let recipientPublicKeys: RecipientPublicKey.Values = [
    bob,
    carol,
   ].map(kp => kp.publicKey)
   let visibleRecipients: boolean = false

   let data = Uint8Array.from(Array(3000100))

   let encrypt = new Encrypt.Encrypt(
    senderKeyPair,
    recipientPublicKeys,
    visibleRecipients,
    data,
   )

   console.log(encrypt.wirePackets())

   let decrypt = new Encrypt.Decrypt(
    encrypt,
    bob,
   )

   console.log(decrypt)
   console.log(decrypt.data())

   assert.deepEqual(
    decrypt.data(),
    data,
   )

  })

 })
})
