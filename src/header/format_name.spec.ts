import * as FormatName from './format_name'
import * as MP from '../messagepack/messagepack'
import 'mocha'
import { strict as assert } from 'assert'
import * as D from 'io-ts/Decoder'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'

describe('FormatName', () => {
 describe('messagepack', () => {
  const testPackValue = (tests:Array<[FormatName.Value, FormatName.Encoded, MP.Value]>) => {
   for (let test of tests) {
    let [value, encoded, packed] = test
    assert.deepEqual(encoded, FormatName.Codec.encode(value))
    assert.deepEqual(packed, MP.Codec.encode(FormatName.Codec.encode(value)))
    assert.deepEqual(E.right(encoded), MP.Codec.decode(MP.Codec.encode(FormatName.Codec.encode(value))))
    assert.deepEqual(E.right(value), pipe(
     MP.Codec.encode(FormatName.Codec.encode(value)),
     MP.Codec.decode,
     E.chain(FormatName.Codec.decode),
    ))
   }
  }

  it('each FormatName has the correct pack value', () => {
   testPackValue([
    [FormatName.Value.SaltPack, "saltpack", Uint8Array.from([168, 115, 97, 108, 116, 112, 97, 99, 107])],
   ])
  })

  it('parse has some error handling', () => {
   // this error happens when a runtime value is structurally sound according to
   // the typescript type system but doesn't map to any known FormatName
   assert.ok(
    E.isLeft(
     FormatName.Codec.decode("Saltpack")
    )
   )

   // this error happens when a runtime unpack subverts typescript type rails
   assert.ok(
    E.isLeft(
     FormatName.Codec.decode(MP.Codec.decode(Buffer.from([145, 3])))
    )
   )
  })
 })
})
