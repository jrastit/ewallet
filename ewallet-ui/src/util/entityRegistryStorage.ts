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
  entityRegistryFromJson,
  entityRegistryLoad,
  entityRegistryDelete
}
