import * as RecipientPublicKey from './recipient_public_key'
import * as PayloadKeyBox from './payload_key_box'
import * as D from 'io-ts/Decoder'
import * as E from 'io-ts/Encoder'
import * as C from 'io-ts/Codec'

// > The recipients list contains a recipient pair for each recipient key,
// > including an encrypted copy of the payload key (see below). Note that a
// > MessagePack array can hold at most at most 2³² − 1 elements, so therefore
// > an encrypted message can have at most 2³² − 1 recipients.
export type Item = [ RecipientPublicKey.Value | null, PayloadKeyBox.Value ]
export type Value = Array<Item>
export type Encoded = Array<[ RecipientPublicKey.Encoded | null, PayloadKeyBox.Encoded ]>

export const decoder: D.Decoder<unknown, Value> = D.array(D.tuple(D.nullable(RecipientPublicKey.decoder), PayloadKeyBox.decoder))

export const encoder: E.Encoder<Encoded, Value> = {
 encode: (v: Value) => v.map(item =>
   [
    (item[0] === null ? null : RecipientPublicKey.Codec.encode(item[0])),
    PayloadKeyBox.Codec.encode(item[1]),
   ]
  )
}

export const Codec: C.Codec<unknown, Encoded, Value> = C.make(decoder, encoder)
