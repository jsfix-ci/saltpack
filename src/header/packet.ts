interface Packet {
 readonly formatName: FormatName,
 readonly version: Version,
 readonly mode: Mode,
 readonly ephemeralPublicKey: EphemeralPublicKey,
 readonly senderSecretBox: SenderSecretBox,
 readonly recipientsList: RecipientsList,
}

function packValue(packet: Packet) {
 let list = [];
 for v in [
  packet.formatName,
  packet.version,
  packet.mode,
  packet.ephemeralPublicKey,
  packet.senderSecretBox,
  packet.recipientsList,
 ] {
  list += packValue(v)
 }
 return list
}
