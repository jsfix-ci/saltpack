import * as Mode from './mode'
import * as MP from '../messagepack/messagepack'
import 'mocha'
import { strict as assert } from 'assert'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'

describe('Mode', () => {
 describe('messagepack', () => {
  const testPackValue = (tests:Array<[Mode.Value, Mode.Encoded, MP.Value]>) => {
   for (let test of tests) {
    let [value, encoded, packed] = test
    assert.deepEqual(encoded, Mode.Codec.encode(value))
    assert.deepEqual(packed, MP.Codec.encode(Mode.Codec.encode(value)))
    assert.deepEqual(E.right(encoded), MP.Codec.decode(MP.Codec.encode(Mode.Codec.encode(value))))
    assert.deepEqual(E.right(value), pipe(
     MP.Codec.encode(Mode.Codec.encode(value)),
     MP.Codec.decode,
     E.chain(Mode.Codec.decode),
    ))
   }
  }

  it('each version has the correct pack value', () => {
   testPackValue([
    [Mode.Value.Encryption, 0, Uint8Array.from([0])],
    [Mode.Value.AttachedSigning, 1, Uint8Array.from([1])],
    [Mode.Value.DetachedSigning, 2, Uint8Array.from([2])],
    [Mode.Value.Signcryption, 3, Uint8Array.from([3])],
   ])
  })

  it('parse has some error handling', () => {
   // this error happens when a runtime value is structurally sound according to
   // the typescript type system but doesn't map to any known version
   assert.ok(
    E.isLeft(
     Mode.Codec.decode(1000),
    )
   )

   // this error happens when a runtime unpack subverts the typescript type
   // system by creating a version tuple with a major but no minor value
   assert.ok(
    E.isLeft(
     Mode.Codec.decode(MP.Codec.decode(Buffer.from([146, 3, 3]))),
    )
   )
  })
 })
})
