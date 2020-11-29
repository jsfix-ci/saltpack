import * as NaCl from 'tweetnacl'
import * as D from 'io-ts/lib/Decoder'
import * as PublicKey from './public_key'
import * as SecretKey from './secret_key'

// Boilerplate wrapper for a secret/public key pair.

export const decoder = D.type({
  publicKey: PublicKey.decoder,
  secretKey: SecretKey.decoder
})

export type Value = D.TypeOf<typeof decoder>

export const generate = ():Value => NaCl.box.keyPair()
