import { EphemeralPublicKey } from './ephemeral_public_key'
import { pack, unpack, MessagePackData } from '../messagepack/messagepack'
import 'mocha'
import { strict as assert } from 'assert'

describe('EphemeralPublicKey', () => {
 describe('messagepack', () => {
  const testPackValue = (tests:Array<[EphemeralPublicKey, EphemeralPublicKey.Encoded, MessagePackData]>) => {
   for (let test of tests) {
    let [value, encoded, packed] = test
    assert.deepEqual(encoded, value.encode())
    assert.deepEqual(Buffer.from(packed), pack(value.encode()))
    assert.deepEqual(Buffer.from(encoded), unpack(pack(value.encode())))
    assert.deepEqual(value, EphemeralPublicKey.decode(unpack(pack(value.encode()))))
   }
  }

  it('each version has the correct pack value', () => {
   testPackValue([
    [
     new EphemeralPublicKey(Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32])),
     Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]),
     [196, 32, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]
    ],
   ])
  })

  it('parse has some error handling', () => {
   // this error happens when a runtime value is structurally sound according to
   // the typescript type system but doesn't have the right length
   assert.deepEqual(
    EphemeralPublicKey.decode(Uint8Array.from([1])),
    Error('EphemeralPublicKey failed to decode {"0":1}'),
   )

   // this error happens when a runtime unpack subverts typescript type rails
   assert.deepEqual(
    EphemeralPublicKey.decode(unpack(Buffer.from([145, 3]))),
    Error('EphemeralPublicKey failed to decode [3]'),
   )
  })
 })
})
