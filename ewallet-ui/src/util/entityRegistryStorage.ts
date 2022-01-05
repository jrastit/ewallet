import { EntityRegistry, AddEntityToList } from '../class/EntityRegistry'
import { ethers } from 'ethers'

const entityRegistryFromJson = (
  json: string | null,
  addEntityToList: AddEntityToList,
  signer?: ethers.Signer
) => {
  if (json) {
    const props = JSON.parse(json)
    return new EntityRegistry({
      ...props,
      signer,
      addEntityToList
    })
  }
}

const entityRegistryFromAddress = async (
  entityRegistryAddress: string | undefined,
  networkName: string,
  addEntityToList: AddEntityToList,
  signer?: ethers.Signer,
) => {
  console.log("entityRegistryAddress", entityRegistryAddress)
  if (entityRegistryAddress && signer) {
    const entityRegistry = new EntityRegistry({
      signer,
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
  addEntityToList: AddEntityToList,
  signer?: ethers.Signer
) => {
  let entityRegistry
  try {
    entityRegistry = entityRegistryFromJson(
      localStorage.getItem("entityRegistry_" + networkName),
      addEntityToList,
      signer)
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
