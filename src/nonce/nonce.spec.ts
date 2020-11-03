import * as Nonce from './nonce'
import { strict as assert } from 'assert'

describe('Nonce', () => {
  it('should nonce correctly', () => {
   assert.deepEqual(
    Uint8Array.from([1, 2, 3, 4, 0, 0, 0, 0, 0, 0, 0, 1]),
    Nonce.indexed(Uint8Array.from([1, 2, 3, 4]), 1),
   )
 })
})
