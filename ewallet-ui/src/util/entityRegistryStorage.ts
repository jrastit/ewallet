import { EntityRegistry } from '../class/EntityRegistry'
import { ethers } from 'ethers'

const entityRegistryFromJson = (json: string | null, signer?: ethers.Signer) => {
  if (json) {
    const props = JSON.parse(json)
    return new EntityRegistry({
      ...props,
      signer: signer,
    })
  }
}

const entityRegistryFromAddress = async (
  entityRegistryAddress: string | undefined, networkName: string, signer?: ethers.Signer
) => {
  console.log("entityRegistryAddress", entityRegistryAddress)
  if (entityRegistryAddress && signer) {
    const entityRegistry = new EntityRegistry({
      signer,
      networkName,
      contractAddress: entityRegistryAddress,
    })
    return await entityRegistry.init()
  }
}

const entityRegistryHasCache = (networkName: string) => {
  if (localStorage.getItem("entityRegistry_" + networkName)) {
    return true
  }
  return false
}

const entityRegistryLoad = async (networkName: string, signer?: ethers.Signer) => {
  let entityRegistry
  try {
    entityRegistry = entityRegistryFromJson(localStorage.getItem("entityRegistry_" + networkName), signer)
  } catch (error) {
    console.error(error)
    entityRegistryDelete(networkName)
    return
  }
  if (entityRegistry) {
    return await entityRegistry.init()
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
