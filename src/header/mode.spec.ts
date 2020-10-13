import { Mode } from './mode'
import { pack, unpack, MessagepackSerializedData } from '../messagepack/messagepack'
import 'mocha'
import { strict as assert } from 'assert'

describe('Mode', () => {
 describe('messagepack', () => {
  const testPackValue = (tests:Array<[Mode, Mode.Encoded, MessagepackSerializedData]>) => {
   for (let test of tests) {
    let [value, encoded, packed] = test
    assert.deepEqual(encoded, value.encode())
    assert.deepEqual(Buffer.from(packed), pack(value.encode()))
    assert.deepEqual(encoded, unpack(pack(value.encode())))
    assert.deepEqual(value, Mode.decode(unpack(pack(value.encode()))))
   }
  }

  it('each version has the correct pack value', () => {
   testPackValue([
    [new Mode(Mode.Value.Encryption), 0, [0]],
    [new Mode(Mode.Value.AttachedSigning), 1, [1]],
    [new Mode(Mode.Value.DetachedSigning), 2, [2]],
    [new Mode(Mode.Value.Signcryption), 3, [3]],
   ])
  })

  it('parse has some error handling', () => {
   // this error happens when a runtime value is structurally sound according to
   // the typescript type system but doesn't map to any known version
   assert.deepEqual(
    Mode.decode(1000),
    Error('Mode failed to decode 1000'),
   )

   // this error happens when a runtime unpack subverts the typescript type
   // system by creating a version tuple with a major but no minor value
   assert.deepEqual(
    Mode.decode(unpack(Buffer.from([146, 3, 3]))),
    Error('Mode failed to decode [3,3]'),
   )
  })
 })
})
