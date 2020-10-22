import * as Version from './version'
import { pack, unpack, MessagePackData } from '../messagepack/messagepack'
import 'mocha'
import { strict as assert } from 'assert'
import { isLeft, right } from 'fp-ts/lib/Either'

describe('Version', () => {
 describe('messagepack', () => {
  const testPackValue = (tests:Array<[Version.Value, Version.Encoded, MessagePackData]>) => {
   for (let test of tests) {
    let [value, encoded, packed] = test
    assert.deepEqual(encoded, Version.Codec.encode(value))
    assert.deepEqual(Buffer.from(packed), pack(Version.Codec.encode(value)))
    assert.deepEqual(encoded, unpack(pack(Version.Codec.encode(value))))
    assert.deepEqual(right(value), Version.Codec.decode(unpack(pack(Version.Codec.encode(value)))))
   }
  }

  it('each version has the correct pack value', () => {
   testPackValue([
    [Version.Value.One, [ 1, 0 ], [146, 1, 0]],
    [Version.Value.Two, [ 2, 0 ], [146, 2, 0]],
   ])
  })

  it('parse has some error handling', () => {
   // this error happens when a runtime value is structurally sound according to
   // the typescript type system but doesn't map to any known version
   assert.ok(
    isLeft(
     Version.Codec.decode([3, 0])
    )
   )

   // this error happens when a runtime unpack subverts the typescript type
   // system by creating a version tuple with a major but no minor value
   assert.ok(
    isLeft(
     Version.Codec.decode(unpack(Buffer.from([145, 3])))
    )
   )
  })
 })
})
