import * as Version from './version'
import * as MP from '../messagepack/messagepack'
import 'mocha'
import { strict as assert } from 'assert'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'

describe('Version', () => {
 describe('messagepack', () => {
  const testPackValue = (tests:Array<[Version.Value, Version.Encoded, MP.Value]>) => {
   for (let test of tests) {
    let [value, encoded, packed] = test
    assert.deepEqual(encoded, Version.Codec.encode(value))
    assert.deepEqual(packed, MP.Codec.encode(Version.Codec.encode(value)))
    assert.deepEqual(E.right(encoded), MP.Codec.decode(MP.Codec.encode(Version.Codec.encode(value))))
    assert.deepEqual(E.right(value), pipe(
     MP.Codec.encode(Version.Codec.encode(value)),
     MP.Codec.decode,
     E.chain(Version.Codec.decode),
    ))
   }
  }

  it('each version has the correct pack value', () => {
   testPackValue([
    [Version.Value.One, [ 1, 0 ], Uint8Array.from([146, 1, 0])],
    [Version.Value.Two, [ 2, 0 ], Uint8Array.from([146, 2, 0])],
   ])
  })

  it('parse has some error handling', () => {
   // this error happens when a runtime value is structurally sound according to
   // the typescript type system but doesn't map to any known version
   assert.ok(
    E.isLeft(
     Version.Codec.decode([3, 0])
    )
   )

   // this error happens when a runtime unpack subverts the typescript type
   // system by creating a version tuple with a major but no minor value
   assert.ok(
    E.isLeft(
     Version.Codec.decode(MP.Codec.decode(Buffer.from([145, 3])))
    )
   )
  })
 })
})
