import * as RecipientsList from './recipients_list'
import * as MP from '../messagepack/messagepack'
import 'mocha'
import { strict as assert } from 'assert'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'

describe('RecipientsList', () => {
 describe('messagepack', () => {
  const testPackValue = (tests:Array<[RecipientsList.Value, RecipientsList.Encoded, MP.Value]>) => {
   for (let test of tests) {
    let [value, encoded, packed] = test
    assert.deepEqual(encoded, RecipientsList.Codec.encode(value))
    assert.deepEqual(packed, MP.Codec.encode(RecipientsList.Codec.encode(value)))
    assert.deepEqual(E.right(encoded), MP.Codec.decode(MP.Codec.encode(RecipientsList.Codec.encode(value))))
    assert.deepEqual(E.right(value), pipe(
     MP.Codec.encode(RecipientsList.Codec.encode(value)),
     MP.Codec.decode,
     E.chain(RecipientsList.Codec.decode),
    ))
   }
  }

  it('each version has the correct pack value', () => {
   testPackValue([
    [
     [
      [
       Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]),
       Uint8Array.from([1, 2, 3, 4, 5]),
      ]
     ],
     [
      [
       Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]),
       Uint8Array.from([1, 2, 3, 4, 5])
      ]
     ],
     Uint8Array.from([145, 146, 196, 32, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 196, 5, 1, 2, 3, 4, 5]),
    ],
   ])
  })

  it('decode has some error handling', () => {
   // this error happens when a runtime unpack subverts typescript type rails
   assert.ok(
    E.isLeft(
     RecipientsList.Codec.decode(MP.Codec.decode(Buffer.from([168, 115, 97, 108, 116, 112, 97, 99, 107]))),
    )
   )
  })
 })
})
