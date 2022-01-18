import { EntityRegistry, AddEntityToList } from '../model/EntityRegistry'

class LocalEntityRegistry extends EntityRegistry {

  constructor(
    props: {
      addEntityToList?: AddEntityToList
    }
  ) {
    super(props)
  }


  toStringObj() {
    return {
      ...super.toStringObj()
    }
  }
}

export type { AddEntityToList }
export { LocalEntityRegistry }
