// > The format name is the string "saltpack".
export enum FormatName {
 SaltPack = "saltpack"
}

export function value(formatName:FormatName):string {
 return FormatName.SaltPack
}

export function parse(value:string):FormatName|Error {
 return value === FormatName.SaltPack ? FormatName.SaltPack : Error('failed to parse a FormatName from: ' + JSON.stringify(value))
}
