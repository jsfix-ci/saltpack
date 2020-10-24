import * as BoxKeyPair from './box_keypair'
import { strict as assert } from 'assert'

describe('BoxKeyPair', () => {
 describe('BoxKeyPair', () => {
  it('generates new keypairs', () => {
   let keypair = BoxKeyPair.generate()
   assert.equal(keypair.publicKey.length, 32)
   assert.equal(keypair.secretKey.length, 32)
  })
 })
})
