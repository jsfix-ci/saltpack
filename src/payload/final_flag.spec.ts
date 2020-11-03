import * as FinalFlag from './final_flag'
import { strict as assert } from 'assert'

describe('FinalFlag', () => {
 describe('FinalFlag', () => {
  it('should encode and decode', () => {
   assert.deepEqual(
    FinalFlag.Value.Final,
    0x01,
   )

   assert.deepEqual(
    FinalFlag.Value.NotFinal,
    0x00,
   )
  })
 })
})
