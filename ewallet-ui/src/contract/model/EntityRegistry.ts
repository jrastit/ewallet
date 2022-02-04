import { Entity } from './Entity'

export type AddEntityToList = (entityRegistry: EntityRegistry, name: string, address: string) => void;

class EntityRegistry {

  addEntityToList?: AddEntityToList
  version: number = 0
  setVersion?: (version: number) => void

  constructor(
    props: {
      addEntityToList?: AddEntityToList
      setVersion?: (version: number) => void
    }
  ) {
    this.addEntityToList = props.addEntityToList
    this.setVersion = props.setVersion
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

  update?(): Promise<void>

  destroy?(): Promise<void>

  loadEntity?(address: string): Promise<Entity>

  createEntity?(
    name: string,
    memberName: string,
    deviceName: string,
  ): Promise<Entity>

  toStringObj() {
    return {
    }
  }

  toJson() {
    return JSON.stringify(this.toStringObj())
  }

  save?(): void

  getInfoTxt?(): Promise<string>
}

export { EntityRegistry }
