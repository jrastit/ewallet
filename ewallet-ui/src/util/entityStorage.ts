import { LocalEntity } from '../class/LocalEntity'
import { ETHEntity } from '../class/ETHEntity'
import { ethers } from 'ethers'

const entityFromJson = (json: string | null, signer?: ethers.Signer) => {
  if (json) {
    const props = JSON.parse(json)
    if (props.contractAddress) {
      const propsSigner = { ...props, signer: signer }
      return new ETHEntity(propsSigner)
    } else {
      return new LocalEntity(props)
    }
  }
}

const entityLoad = async (signer?: ethers.Signer) => {
  let entity
  try {
    entity = entityFromJson(localStorage.getItem("entity"), signer)
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
