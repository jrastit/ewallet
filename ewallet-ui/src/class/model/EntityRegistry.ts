import { Entity } from './Entity'

export type AddEntityToList = (entityRegistry: EntityRegistry, name: string, address: string) => void;

class EntityRegistry {

  addEntityToList?: AddEntityToList

  constructor(
    props: {
      addEntityToList?: AddEntityToList
    }
  ) {
    this.addEntityToList = props.addEntityToList
  }

  async init() {
    return this
  }

  update?(): Promise<void>


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
}

export { EntityRegistry }
