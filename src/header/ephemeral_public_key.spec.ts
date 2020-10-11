import { EphemeralPublicKey, value, parse } from './ephemeral_public_key'
import { pack, unpack, MessagepackSerializedData } from '../messagepack/messagepack'
import 'mocha'
import { strict as assert } from 'assert'

describe('EphemeralPublicKey', () => {
 describe('messagepack', () => {
  const testPackValue = (tests:Array<[EphemeralPublicKey, Uint8Array, MessagepackSerializedData]>) => {
   for (let test of tests) {
    let [ephemeral_public_key, v, packed] = test
    assert.deepEqual(v, value(ephemeral_public_key))
    assert.deepEqual(Buffer.from(packed), pack(value(ephemeral_public_key)))
    assert.deepEqual(Buffer.from(v), unpack(pack(value(ephemeral_public_key))))
    assert.deepEqual(ephemeral_public_key, parse(unpack(pack(value(ephemeral_public_key)))))
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
    parse(Uint8Array.from([1])),
    Error('failed to parse an EphemeralPublicKey from: {"0":1}'),
   )

   // this error happens when a runtime unpack subverts typescript type rails
   assert.deepEqual(
    parse(unpack(Buffer.from([145, 3]))),
    Error('failed to parse an EphemeralPublicKey from: [3]'),
   )
  })
 })
})
