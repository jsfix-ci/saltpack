import { EphemeralPublicKey } from './ephemeral_public_key'
import { pack, unpack, MessagepackSerializedData } from '../messagepack/messagepack'
import 'mocha'
import { strict as assert } from 'assert'

describe('EphemeralPublicKey', () => {
 describe('messagepack', () => {
  const testPackValue = (tests:Array<[EphemeralPublicKey.Value, EphemeralPublicKey.Portable, MessagepackSerializedData]>) => {
   for (let test of tests) {
    let [value, portable, packed] = test
    assert.deepEqual(portable, EphemeralPublicKey.toPortable(value))
    assert.deepEqual(Buffer.from(packed), pack(EphemeralPublicKey.toPortable(value)))
    assert.deepEqual(Buffer.from(portable), unpack(pack(EphemeralPublicKey.toPortable(value))))
    assert.deepEqual(value, EphemeralPublicKey.fromPortable(unpack(pack(EphemeralPublicKey.toPortable(value)))))
   }
  }

  it('each version has the correct pack value', () => {
   testPackValue([
    [
     {
      key: Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32])
     },
     Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]),
     [196, 32, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]
    ],
   ])
  })

  it('parse has some error handling', () => {
   // this error happens when a runtime value is structurally sound according to
   // the typescript type system but doesn't have the right length
   assert.deepEqual(
    EphemeralPublicKey.fromPortable(Uint8Array.from([1])),
    Error('failed to parse a EphemeralPublicKey from: {"0":1}'),
   )

   // this error happens when a runtime unpack subverts typescript type rails
   assert.deepEqual(
    EphemeralPublicKey.fromPortable(unpack(Buffer.from([145, 3]))),
    Error('failed to parse a EphemeralPublicKey from: [3]'),
   )
  })
 })
})
