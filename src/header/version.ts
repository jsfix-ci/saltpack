const one: [ number, number ] = [ 1, 0 ]
const two: [ number, number ] = [ 2, 0 ]

// > The version is a list of the major and minor versions, currently [2, 0], both encoded as positive fixnums.
export enum Version {
 One,
 Two,
}

export function value(version:Version):[ number, number ] {
 switch (version) {
  case Version.One: return one
  case Version.Two: return two
 }
}

export function parse(value:[number, number]):Version|Error {
 let [ major, minor ] = value

 // currently there are no minor versions
 if ( minor === 0 ) {
  switch(major) {
   case 1: return Version.One
   case 2: return Version.Two
  }
 }
 return Error('failed to parse a Version from: ' + JSON.stringify(value))
}
