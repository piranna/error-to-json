import stringify from 'fast-safe-stringify'

export default errToJSON

const nonEnumerablePropsToCopy = ['code', 'errno', 'syscall']

function Error_prototype_toJSON(this: Error) {
  const json = {
    // Add all enumerable properties
    ...this,
    // normal props
    name: this.name,
    message: this.message,
    stack: this.stack,
  }

  nonEnumerablePropsToCopy.forEach((key) => {
    // @ts-ignore
    if (key in this) json[key] = this[key]
  })

  return JSON.parse(stringify(json))
}

export function errToJSON<T extends {}>(json: any): T {
  // @ts-ignore
  const {toJSON} = Error.prototype

  // @ts-ignore
  Error.prototype.toJSON = Error_prototype_toJSON

  // get error json
  // @ts-ignore
  if(json.toJSON) json = json.toJSON()

  // unstub error tojson
  // @ts-ignore
  Error.prototype.toJSON = toJSON

  // return error json
  return json
}

export function parse(json: { message: string }) {
  const err = new Error(json.message)
  const stack = err.stack || ''
  Object.assign(err, json)
  if (err.stack === stack) {
    // remove stacktrace generated by error constructor above
    err.stack = stack.slice(0, stack.indexOf('\n'))
  }
  return err
}
