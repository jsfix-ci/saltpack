import * as HeaderPacket from '../header/packet'
import * as BoxKeyPair from '../ed25519/box_keypair'
import * as RecipientPublicKeys from '../header/recipient_public_key'
import * as Mode from '../header/mode'
import * as PayloadPacket from '../payload/packet'
import * as FinalFlag from '../payload/final_flag'
import * as Stream from 'readable-stream'
import * as Chunk from '../chunk/chunk'
const pumpify = require('pumpify')

export const CHUNK_BYTES = 1000000

export const Encrypt = (
  maybeSenderKeyPair:BoxKeyPair.Value | null | undefined,
  recipientPublicKeys:RecipientPublicKeys.Values,
  visibleRecipients:boolean
) => {
  const chunkStream = Chunk.stream(CHUNK_BYTES)
  const encryptStream = new Stream.Transform({ objectMode: true })
  const mode: Mode.Value = Mode.Value.Encryption
  const headerPacket = new HeaderPacket.Sender(
    mode,
    maybeSenderKeyPair,
    recipientPublicKeys,
    visibleRecipients
  )

  encryptStream._transform = (chunk:Chunk.Chunk, encoding, done) => {
    // Always start the stream with the headerPacket.
    if (chunk.index === 0) {
      encryptStream.push(headerPacket.packetWire())
    }

    // Encrypt each chunk as provided by the chunk stream.
    encryptStream.push(new PayloadPacket.Sender(
      chunk.index,
      chunk.final ? FinalFlag.Value.Final : FinalFlag.Value.NotFinal,
      headerPacket,
      chunk.data
    ).packetWire())

    done()
  }

  return pumpify(chunkStream, encryptStream)
}

export const Decrypt = (
  recipientKeyPair: BoxKeyPair.Value
) => {
  const stream = new Stream.Transform({ objectMode: true })
  let header: HeaderPacket.Receiver
  let index = 0
  let finalised = false

  stream._transform = (chunk:any, encoding, done) => {
    // The first chunk must be the header.
    // We keep the header in scope rather than forwarding it downstream.
    if (!header) {
      try {
        header = new HeaderPacket.Receiver(recipientKeyPair, chunk)
        done()
      } catch (e) {
        // Bad header immediately destroys the stream.
        // return here to help typescript understand this is fatal.
        return stream.destroy(e)
      }
    } else {
      // All other chunks are decrypted at their index using the header.
      let payloadPacket
      try {
        payloadPacket = new PayloadPacket.Receiver(index, header, chunk)
      } catch (e) {
        // Bad payload immediately destroys the stream.
        // return here to help typescript understand this is fatal.
        return stream.destroy(e)
      }
      index++
      // The stream must end when we receive the finalFlag.
      // It is an error to receive more data after the finalFlag.
      if (payloadPacket.finalFlag()) {
        finalised = true
        stream.end()
      }

      // We have valid data!
      done(undefined, payloadPacket.chunk())
    }
  }

  stream._flush = (done) => {
    // The stream must never end before we received the finalFlag.
    if (!finalised) {
      return stream.destroy(new Error('decrypt stream ended before finalising data'))
    }
    done()
  }

  return stream
}
