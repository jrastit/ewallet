
class Entity {

  version: number
  setVersion?: (version: number) => void

  constructor() {
    if (this.constructor === Entity) {
      throw new TypeError('Abstract class "Entity" cannot be instantiated directly');
    }
    this.version = 0
  }

  toStringObj() {
    return ({

    })
  }

  async init() {
    return this
  }

  incVersion() {
    this.version += 1
    if (this.setVersion) {
      this.setVersion(this.version)
    }
  }
  getName(): Promise<string | undefined>

  async getName() {
    return undefined
  }
  update(): Promise<void>

  async update() {

  }

  getMemberIdFromAddress?(address: string): Promise<number>

  getInfoTxt?(): Promise<string>
}

export { Entity }
