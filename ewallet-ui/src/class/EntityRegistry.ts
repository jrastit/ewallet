import { ethers } from 'ethers'

import {
  createRegistryContract,
  getRegistryContract,
  getWalletContract,
} from '../contract/contractFactory'

import { ETHEntity } from './ETHEntity'

class EntityRegistry {
  contractAddress?: string
  signer: ethers.Signer
  contract?: ethers.Contract
  entityList: { name: string, address: string }[]
  networkName: string

  constructor(
    props: {
      signer: ethers.Signer,
      contractAddress?: string,
      networkName: string,
    }
  ) {
    this.contractAddress = props.contractAddress
    this.signer = props.signer
    this.entityList = []
    this.networkName = props.networkName
  }

  async init() {
    if (!this.contractAddress) {
      this.contract = await createRegistryContract(this.signer)
      this.contractAddress = this.contract.address
    } else {
      this.contract = await getRegistryContract(this.contractAddress, this.signer)
      await this.update()
    }
    this.save()
    return this
  }

  async update() {
    if (this.contract) {
      const entityListChain = await this.contract.getEntityList()
      console.log("entityList", entityListChain)

      const newEntityList: Array<{ name: string, address: string }> = await Promise.all<{ name: string, address: string }>(
        entityListChain.map(async (address: string) => {
          const contract = await getWalletContract(address, this.signer)
          const name = await contract.name()
          //console.log("entity : ", address, name)
          return { name: name, address: address }
        }));
      this.entityList = newEntityList
    }
  }

  async loadEntity(
    address: string,
  ) {
    const entity = new ETHEntity({
      networkName: this.networkName,
      signer: this.signer,
      contractAddress: address,
    })
    await entity.init()
    return entity
  }

  async createEntity(
    name: string,
    memberName: string,
    deviceName: string,
  ) {
    if (this.contract) {
      const tx = await this.contract.createEntitySelf(name, memberName, deviceName)
      const confirm = await tx.wait()
      const entityAddress = confirm.events[0].args.wallet
      return entityAddress
    } else {
      throw new Error("Contract not initialized")
    }
  }

  toString() {
    return {
      networkName: this.networkName,
      contractAddress: this.contractAddress,
      /*
      entityList: this.entityList.map(entity => {
        return entity.toString()
      })
      */
    }
  }

  toJson() {
    return JSON.stringify(this.toString())
  }

  save() {
    localStorage.setItem("entityRegistry_" + this.networkName, this.toJson())
  }
}

export { EntityRegistry }
