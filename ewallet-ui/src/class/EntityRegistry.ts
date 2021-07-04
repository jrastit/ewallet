import { ethers } from 'ethers'

import { Entity } from './Entity'
import { ETHEntity } from './ETHEntity'

import bytecodePath from '../contract/solidity/bin/contract_solidity_EWalletRegistry_sol_EWalletRegistry.bin'
import abiPath from '../contract/solidity/bin/contract_solidity_EWalletRegistry_sol_EWalletRegistry.abi'

class EntityRegistry {
  contractAddress?: string
  signer: ethers.Signer
  contract?: ethers.Contract
  entityList: Entity[]
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

    const abi = await (await fetch(abiPath)).text()

    if (!this.contractAddress) {

      const bytecode = await (await fetch(bytecodePath)).text()

      const factory = new ethers.ContractFactory(abi, bytecode, this.signer)

      this.contract = await factory.deploy()

      await this.contract.deployed()

      this.contractAddress = this.contract.address

    } else {
      this.contract = new ethers.Contract(this.contractAddress, abi, this.signer)
      await this.update()
    }

    this.save()
    return this
  }

  async update() {
    if (this.contract) {
      const entityListSize = await this.contract.entityListSize()
      if (entityListSize) {
        console.log("entityListSize", entityListSize.toNumber())
        const entityListChainPromise = []
        for (let i = 0; i < entityListSize.toNumber(); i++) {
          entityListChainPromise.push(this.contract.entityList(i))
        }
        this.entityList = await Promise.all((await Promise.all(entityListChainPromise)).map(async entityAddress => {
          return await (new ETHEntity({
            contractAddress: entityAddress,
            networkName: this.networkName,
            signer: this.signer,
          })).init()
        }))
        /*
        entityList.forEach(entity => {
          this.entityList.filter(entity => entity.contractAddress == entity)
        });
        */
      }
    }
  }

  async createEntity(
    name: string,
    memberName: string,
    deviceName: string,
  ) {
    if (this.contract) {
      const tx = await this.contract.createEntity(name, memberName, deviceName)
      const confirm = await tx.wait()
      const idx = confirm.events[0].args._index.toNumber()
      const entityAddress = await this.contract.entityList(idx)
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
