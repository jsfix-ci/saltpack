export enum Mode {
 Encryption = 0,
 AttachedSigning = 1,
 DetachedSigning = 2,
 Signcryption = 3,
}

export function value(mode:Mode):number {
 return mode
}

export function parse(value:number):Mode|Error {
 switch (value) {
  case 0: return Mode.Encryption
  case 1: return Mode.AttachedSigning
  case 2: return Mode.DetachedSigning
  case 3: return Mode.Signcryption
 }
 return Error('failed to parse a Mode from: ' + JSON.stringify(value))
}
