import { AddEntityToList } from '../contract/model/EntityRegistry'
import { TransactionManager } from './TransactionManager'
import { EthersEntityRegistry } from '../contract/ethers/EthersEntityRegistry'

const entityRegistryFromJson = (
  json: string | null,
  addEntityToList?: AddEntityToList,
  transactionManager?: TransactionManager
) => {
  if (json) {
    const props = JSON.parse(json)
    return new EthersEntityRegistry({
      ...props,
      transactionManager,
      addEntityToList
    })
  }
}

const entityRegistryFromAddress = async (
  entityRegistryAddress: string | undefined,
  networkName: string,
  addEntityToList: AddEntityToList,
  transactionManager?: TransactionManager
) => {
  console.log("entityRegistryAddress", entityRegistryAddress)
  if (entityRegistryAddress && transactionManager) {
    const entityRegistry = new EthersEntityRegistry({
      transactionManager,
      networkName,
      contractAddress: entityRegistryAddress,
      addEntityToList,
    })
    return entityRegistry
  }
}

const entityRegistryHasCache = (networkName: string) => {
  if (localStorage.getItem("entityRegistry_" + networkName)) {
    return true
  }
  return false
}

const entityRegistryLoad = async (
  networkName: string,
  addEntityToList?: AddEntityToList,
  transactionManager?: TransactionManager
) => {
  let entityRegistry
  try {
    entityRegistry = entityRegistryFromJson(
      localStorage.getItem("entityRegistry_" + networkName),
      addEntityToList,
      transactionManager)
    entityRegistry && await entityRegistry.init()
    return entityRegistry
  } catch (error) {
    console.error(error)
    entityRegistryDelete(networkName)
    return
  }
}

const entityRegistryDelete = (networkName: string) => {
  return localStorage.removeItem("entityRegistry_" + networkName)
}

export {
  entityRegistryHasCache,
  entityRegistryFromAddress,
  entityRegistryFromJson,
  entityRegistryLoad,
  entityRegistryDelete
}
