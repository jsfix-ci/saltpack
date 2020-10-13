import { RecipientPublicKey } from './recipients_list'
import { pack, unpack, MessagepackSerializedData } from '../messagepack/messagepack'
import 'mocha'
import { strict as assert } from 'assert'

describe('RecipientPublicKey', () => {
 describe('messagepack', () => {
  const testPackValue = (tests:Array<[RecipientPublicKey.Value, RecipientPublicKey.Portable, MessagepackSerializedData]>) => {
   for (let test of tests) {
    let [value, portable, packed] = test
    assert.deepEqual(portable, RecipientPublicKey.toPortable(value))
    assert.deepEqual(Buffer.from(packed), pack(RecipientPublicKey.toPortable(value)))
    if (portable instanceof Uint8Array) {
     assert.deepEqual(Buffer.from(portable), unpack(pack(RecipientPublicKey.toPortable(value))))
    }
    assert.deepEqual(value, RecipientPublicKey.fromPortable(unpack(pack(RecipientPublicKey.toPortable(value)))))
   }
  }

  it('each version has the correct pack value', () => {
   testPackValue([
    [
     {
      maybe_key: Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32])
     },
     Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]),
     [196, 32, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]
    ],
    // [
    //  {
    //   maybe_key: null,
    //  },
    //  Uint8Array.from([196]),
    //  [196],
    // ]
   ])
  })

  it('fromPortable has some error handling', () => {
   // this error happens when a runtime unpack subverts typescript type rails
   assert.deepEqual(
    RecipientPublicKey.fromPortable(unpack(Buffer.from([168, 115, 97, 108, 116, 112, 97, 99, 107]))),
    Error('failed to parse a RecipientPublicKey from: "saltpack"'),
   )
  })
 })
})
