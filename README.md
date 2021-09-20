# saltpack

## Exports

This library has two exports, `Encrypt` and `Decrypt`.

Both build transform streams and streams are the only way to interact with this
library. Generally this is what you want because:

- Files and URLs can all be streamed easily in nodejs
- Saltpack is designed to handle large data in 1MB chunks
 - Failing to stream is very slow and can quickly consume system memory
 - The cryptographic protocol is carefully designed to support streams
- Streams are composable and once piped together, there are minimal moving parts
- Saltpack data is very awkward to handle efficiently without streams because
  the packets are simply concatenated binary, NOT a serialized list structure

### Encrypt

Builds an encrypt stream that writes raw binary data in a `Buffer` to `Encrypt`
and read out saltpack encrypted binary packets. The first packet is the header
and then all following packets are payloads, with the last packet being set with
a `true` final flag.

Payload chunks are all `1000000` bytes maximum, as per saltpack.

All output is raw, unarmoured binary (no baseX, etc.).

IMPORTANT: An encrypt stream MUST be ended, e.g. with `stream.end()` otherwise
the final chunk will never be flushed downstream and the data will be corrupted.

Encrypt builds a stream with three required arguments:

- Sender keypair: The public and private keypair of the encryptor OR `null`.
                  If `null` the ephemeral keypair will be used allowing Alice
                  to remain anonymous to Bob.
- Recipient public keys: An array of all recipients of the encrypted data.
- Visible recipients: `false` to anonymise recipients (only `false` works atm).

```javascript
const encryptStream = Encrypt.Encrypt(
  senderKeyPair,
  recipientPublicKeys,
  visibleRecipients
)
```

All crypto keys must be 32 byte `Uint8Arrays`.

### Decrypt

Builds a decrypt stream that attempts to decrypt packets produced by an
`Encrypt` stream.

Expects _decoded messagepack_ items from the `Encrypt` stream output.

Ideally the messagepack decoding would be handled internally to the `Decrypt`
stream but there is a mismatch between the official messagepack stream handling
(based on async iterators) and native node streams (e.g. reading a file).

`Decrypt` has only one argument, the recipient public and private key pair.

Any failure to verify, read or decrypt any packet _immediately_ destroys the
stream, so make sure to implement error handling.

Notably, the recipient public key simply not being in the header payload is a
fatal error for the decrypt stream.

Example:

```javascript
import * as FS from 'fs'
import * as MP from '@msgpack/msgpack'
import * as Encrypt from '@hummhive/saltpack'

const readStream = FS.createReadStream('ecrypted-file.txt')
const decryptStream = Encrypt.Decrypt(
  recipientKeyPair
)
const writeStream = FS.createWriteStream('decrypted-file.txt')

// Normal stream piping.
decryptStream.pipe(writeStream)

// Async iterator over messagepack items from the encrypted file.
for await (const item of MP.decodeStream(readStream)) {
  decryptStream.write(item)
}
```

## How to release

CI automatically publishes to npm if it notices that the version has bumped on
the main branch.

The easiest way to bump the version is by running `npm version minor`.

Push/merge to main and then CI will pick it up.
