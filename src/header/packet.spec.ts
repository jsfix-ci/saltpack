import * as Packet from './packet'
import { strict as assert } from 'assert'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as BoxKeyPair from '../ed25519/box_keypair'
import * as BoxKeyPairFixture from '../ed25519/box_keypair.fixture'
import * as RecipientPublicKey from './recipient_public_key'
import * as Mode from './mode'


describe('Packet', () => {
 describe('Sender', () => {
  it('should construct', () => {
   let mode: Mode.Value = Mode.Value.Encryption
   let senderKeyPair: BoxKeyPair.Value = BoxKeyPairFixture.alice
   let bob: BoxKeyPair.Value = BoxKeyPair.generate()
   let carol: BoxKeyPair.Value = BoxKeyPair.generate()
   let recipientPublicKeys: RecipientPublicKey.Values = [
    bob,
    carol,
   ].map(kp => kp.publicKey)
   let visibleRecipients: boolean = false

   new Packet.Sender(mode, senderKeyPair, recipientPublicKeys, visibleRecipients)
  })
 })
})
