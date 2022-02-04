import { EntityRegistry, AddEntityToList } from '../model/EntityRegistry'

class LocalEntityRegistry extends EntityRegistry {
  /* useless constructor
  constructor(
    props: {
      addEntityToList?: AddEntityToList
    }
  ) {
    super(props)
  }
  */


  toStringObj() {
    return {
      ...super.toStringObj()
    }
  }

  async getInfoTxt(): Promise<string> {
    let txt = "LocalEntityRegistry\n"
    return txt
  }
}

export type { AddEntityToList }
export { LocalEntityRegistry }
