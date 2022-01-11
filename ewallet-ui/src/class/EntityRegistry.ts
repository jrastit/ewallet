import { ethers } from 'ethers'

import {
  createRegistryContract,
} from '../contract/contractFactory'

import {
  getContractEWalletRegistry,
  getContractEWallet,
} from '../contract/solidity/compiled/contractAutoFactory'


import { ETHEntity } from './ETHEntity'

export type AddEntityToList = (entityRegistry: EntityRegistry, name: string, address: string) => void;

class EntityRegistry {
  contractAddress?: string
  signer: ethers.Signer
  contract?: ethers.Contract
  networkName: string
  addEntityToList?: AddEntityToList

  constructor(
    props: {
      signer: ethers.Signer,
      contractAddress?: string,
      networkName: string,
      addEntityToList?: AddEntityToList
    }
  ) {
    this.contractAddress = props.contractAddress
    this.signer = props.signer
    this.networkName = props.networkName
    this.addEntityToList = props.addEntityToList
  }

  async addListener() {
    if (this.contract && this.contract.listenerCount("EWalletCreated") === 0) {
      this.contract.on("EWalletCreated", (name: string, address: string) => {
        if (this.addEntityToList) {
          this.addEntityToList(this, name, address)
        }
      })
    }
  }

  async init() {

    if (!this.contractAddress) {
      this.contract = await createRegistryContract(this.signer)
      this.contractAddress = this.contract.address
      await this.addListener()
    } else {
      this.contract = getContractEWalletRegistry(this.contractAddress, this.signer)
      await this.addListener()
      await this.update()
    }

    this.save()
    return this
  }

  async update() {
    if (this.contract) {
      console.log("Entity registry update")
      const entityListChain = await this.contract.getEntityList()
      entityListChain.map(async (address: string) => {
        console.log(address, this.addEntityToList)
        const contract = getContractEWallet(address, this.signer)
        const name = await contract.name()
        if (this.addEntityToList) {
          this.addEntityToList(this, name, address)
        }
      })
    }
  }

  async destroy() {
    if (this.contract && this.contract.listenerCount("EWalletCreated") > 0) {
      this.contract.removeAllListeners()
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
