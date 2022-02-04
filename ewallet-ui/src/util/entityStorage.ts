import { LocalEntity } from '../contract/local/LocalEntity'
import { EthersEntity } from '../contract/ethers/EthersEntity'
import { TransactionManager } from './TransactionManager'
import { EntityRegistry } from '../contract/model/EntityRegistry'

const entityFromJson = (json: string | null, transactionManager?: TransactionManager, entityRegistry?: EntityRegistry) => {
  if (json) {
    const props = JSON.parse(json)
    if (props.contractAddress) {
      const propsSigner = { ...props, transactionManager }
      return new EthersEntity(entityRegistry, undefined, propsSigner)
    } else {
      return new LocalEntity(entityRegistry, props)
    }
  }
}

const entityLoad = async (transactionManager?: TransactionManager, entityRegistry?: EntityRegistry) => {
  let entity
  try {
    entity = entityFromJson(localStorage.getItem("entity"), transactionManager, entityRegistry)
  } catch (error) {
    console.error(error)
    entityDelete()
    return
  }
  if (entity) {
    return entity.init()
  }

}

const entityDelete = () => {
  return localStorage.removeItem("entity")
}

export { entityFromJson, entityLoad, entityDelete }
