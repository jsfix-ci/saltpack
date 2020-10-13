// > The mode is the number 0, for encryption, encoded as a positive fixnum.
// > (1 and 2 are attached and detached signing, and 3 is signcryption.)
export class Mode {
 private value: Mode.Value
 constructor(value:Mode.Value) {
  this.value = value
 }

 encode():Mode.Encoded {
  return this.value
 }
}

export namespace Mode {
 export type Encoded = number
 export enum Value {
  Encryption = 0,
  AttachedSigning = 1,
  DetachedSigning = 2,
  Signcryption = 3,
 }

 export function decode(encoded:Encoded):Mode|Error {
  if (Value[encoded]) {
   return new Mode(encoded)
  }
  return Error(Mode.name + ' failed to decode ' + JSON.stringify(encoded))
 }
}
