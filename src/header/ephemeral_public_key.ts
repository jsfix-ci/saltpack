export interface EphemeralPublicKey {
 key: Uint8Array
}

export function value(ephemeralPublicKey:EphemeralPublicKey):Uint8Array {
 return ephemeralPublicKey.key
}

export function parse(value:Uint8Array):EphemeralPublicKey|Error {
 return value.length === 32 ? { key: Uint8Array.from(value) } : Error('failed to parse an EphemeralPublicKey from: ' + JSON.stringify(value))
}
