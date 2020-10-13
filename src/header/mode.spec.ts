import { Mode } from './mode'
import { pack, unpack, MessagepackSerializedData } from '../messagepack/messagepack'
import 'mocha'
import { strict as assert } from 'assert'

describe('Mode', () => {
 describe('messagepack', () => {
  const testPackValue = (tests:Array<[Mode, Mode.Encoded, MessagepackSerializedData]>) => {
   for (let test of tests) {
    let [value, portable, packed] = test
    assert.deepEqual(portable, Mode.toPortable(value))
    assert.deepEqual(Buffer.from(packed), pack(Mode.toPortable(value)))
    assert.deepEqual(portable, unpack(pack(Mode.toPortable(value))))
    assert.deepEqual(value, Mode.fromPortable(unpack(pack(Mode.toPortable(value)))))
   }
  }

  it('each version has the correct pack value', () => {
   testPackValue([
    [Mode.Value.Encryption, 0, [0]],
    [Mode.Value.AttachedSigning, 1, [1]],
    [Mode.Value.DetachedSigning, 2, [2]],
    [Mode.Value.Signcryption, 3, [3]],
   ])
  })

  it('parse has some error handling', () => {
   // this error happens when a runtime value is structurally sound according to
   // the typescript type system but doesn't map to any known version
   assert.deepEqual(
    Mode.fromPortable(1000),
    Error('failed to parse a Mode from: 1000'),
   )

   // this error happens when a runtime unpack subverts the typescript type
   // system by creating a version tuple with a major but no minor value
   assert.deepEqual(
    Mode.fromPortable(unpack(Buffer.from([146, 3, 3]))),
    Error('failed to parse a Mode from: [3,3]'),
   )
  })
 })
})
