export function parse(guard:any, build:any, value:any, name:string):any|Error {
 return guard(value) ? build(value) : Error('failed to parse a ' + name + ' from: ' + JSON.stringify(value))
}
