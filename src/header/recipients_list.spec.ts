import { RecipientPublicKey, PayloadKeyBox, RecipientsList } from './recipients_list'
import { pack, unpack, MessagePackData } from '../messagepack/messagepack'
import 'mocha'
import { strict as assert } from 'assert'

describe('RecipientPublicKey', () => {
 describe('messagepack', () => {
  const testPackValue = (tests:Array<[RecipientPublicKey, RecipientPublicKey.Encoded, MessagePackData]>) => {
   for (let test of tests) {
    let [value, encoded, packed] = test
    assert.deepEqual(encoded, value.encode())
    assert.deepEqual(Buffer.from(packed), pack(value.encode()))
    if (encoded instanceof Uint8Array) {
     assert.deepEqual(Buffer.from(encoded), unpack(pack(value.encode())))
    }
    assert.deepEqual(value, RecipientPublicKey.decode(unpack(pack(value.encode()))))
   }
  }

  it('each version has the correct pack value', () => {
   testPackValue([
    [
     new RecipientPublicKey(Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32])),
     Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]),
     [196, 32, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]
    ],
    [
     new RecipientPublicKey(null),
     null,
     [192],
    ]
   ])
  })

  it('decode has some error handling', () => {
   // this error happens when a runtime unpack subverts typescript type rails
   assert.deepEqual(
    RecipientPublicKey.decode(unpack(Buffer.from([168, 115, 97, 108, 116, 112, 97, 99, 107]))),
    Error('RecipientPublicKey failed to decode "saltpack"'),
   )
  })
 })
})

describe('PayloadKeyBox', () => {
 describe('messagepack', () => {
  const testPackValue = (tests:Array<[PayloadKeyBox, PayloadKeyBox.Encoded, MessagePackData]>) => {
   for (let test of tests) {
    let [value, encoded, packed] = test
    assert.deepEqual(encoded, value.encode())
    assert.deepEqual(Buffer.from(packed), pack(value.encode()))
    if (encoded instanceof Uint8Array) {
     assert.deepEqual(Buffer.from(encoded), unpack(pack(value.encode())))
    }
    assert.deepEqual(value, PayloadKeyBox.decode(unpack(pack(value.encode()))))
   }
  }

  it('each version has the correct pack value', () => {
   testPackValue([
    [
     new PayloadKeyBox(Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32])),
     Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]),
     [196, 32, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]
    ],
   ])
  })

  it('decode has some error handling', () => {
   // this error happens when a runtime unpack subverts typescript type rails
   assert.deepEqual(
    PayloadKeyBox.decode(unpack(Buffer.from([168, 115, 97, 108, 116, 112, 97, 99, 107]))),
    Error('PayloadKeyBox failed to decode "saltpack"'),
   )
  })
 })
})

describe('RecipientsList', () => {
 describe('messagepack', () => {
  const testPackValue = (tests:Array<[RecipientsList, RecipientsList.Encoded, MessagePackData]>) => {
   for (let test of tests) {
    let [value, encoded, packed] = test
    assert.deepEqual(encoded, value.encode())
    assert.deepEqual(Buffer.from(packed), pack(value.encode()))
    if (encoded instanceof Uint8Array) {
     assert.deepEqual(Buffer.from(encoded), unpack(pack(value.encode())))
    }
    assert.deepEqual(value, RecipientsList.decode(unpack(pack(value.encode()))))
   }
  }

  it('each version has the correct pack value', () => {
   testPackValue([
    [
     new RecipientsList(
      [
       [
        new RecipientPublicKey(
         Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32])
        ),
        new PayloadKeyBox(
         Uint8Array.from([1, 2, 3, 4, 5])
        ),
       ]
      ]
     ),
     [
      [
       Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]),
       Uint8Array.from([1, 2, 3, 4, 5])
      ]
     ],
     [145, 146, 196, 32, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 196, 5, 1, 2, 3, 4, 5]
    ],
   ])
  })

  it('decode has some error handling', () => {
   // this error happens when a runtime unpack subverts typescript type rails
   assert.deepEqual(
    RecipientsList.decode(unpack(Buffer.from([168, 115, 97, 108, 116, 112, 97, 99, 107]))),
    Error('RecipientPublicKey failed to decode "s"'),
   )
  })
 })
})
