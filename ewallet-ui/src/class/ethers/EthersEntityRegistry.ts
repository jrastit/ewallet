import { ethers } from 'ethers'

import {
  createRegistryContract,
} from '../../contract/contractFactory'

import {
  getContractEWalletRegistry,
  getContractEWallet,
} from '../../contract/solidity/compiled/contractAutoFactory'

import { EthersEntity } from '../ethers/EthersEntity'
import { EthersModuleAdmin } from '../ethers/EthersModuleAdmin'
import { LocalEntityRegistry, AddEntityToList } from '../local/LocalEntityRegistry'

import { getSigner, getContract } from '../../util/ethersGeneric'

class EthersEntityRegistry extends LocalEntityRegistry {

  contractAddress?: string
  signer: ethers.Signer
  contract?: ethers.Contract
  networkName: string
  moduleAdmin?: EthersModuleAdmin

  constructor(
    props: {
      signer: ethers.Signer,
      contractAddress?: string,
      networkName: string,
      addEntityToList?: AddEntityToList
    }
  ) {
    super(props)
    this.contractAddress = props.contractAddress
    this.signer = props.signer
    this.networkName = props.networkName
  }

  getSigner(signer?: ethers.Signer) {
    return getSigner(this, signer)
  }

  getContract() {
    return getContract(this, getContractEWalletRegistry)
  }

  async addListener() {
    if (this.getContract().listenerCount("EWalletCreated") === 0) {
      this.getContract().on("EWalletCreated", (name: string, address: string) => {
        if (this.addEntityToList) {
          this.addEntityToList(this, name, address)
        }
      })
    }
  }

  async newContract(adminEntityName: string, adminEntityManagerName: string, adminEntityDeviceName: string) {
    this.contract = await createRegistryContract(
      adminEntityName,
      adminEntityManagerName,
      adminEntityDeviceName,
      await this.signer.getAddress(),
      this.signer
    )
    this.contractAddress = this.contract.address
  }

  async init() {
    await this.addListener()
    await this.update()
    this.save()
    return this
  }

  async update() {
    const moduleAdminAddress = await this.getContract().getModuleAdmin()
    if (moduleAdminAddress && !(this.moduleAdmin && this.moduleAdmin.contractAddress === moduleAdminAddress)) {
      this.moduleAdmin = new EthersModuleAdmin(this, { contractAddress: moduleAdminAddress })
    }
    console.log("Entity registry update")
    const entityListChain = await this.getContract().getEntityList()
    entityListChain.map(async (address: string) => {
      const contract = getContractEWallet(address, this.signer)
      const name = await contract.name()
      if (this.addEntityToList) {
        this.addEntityToList(this, name, address)
      }
    })
  }

  async destroy() {
    if (this.getContract().listenerCount("EWalletCreated") > 0) {
      this.getContract().removeAllListeners()
    }
  }

  async loadEntity(
    address: string,
  ) {
    const entity = new EthersEntity(
      this,
      undefined,
      {
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
    if (this.moduleAdmin) {
      return await this.moduleAdmin.createEntitySelf(name, memberName, deviceName)
    }
    const entity = new EthersEntity()
    await entity.newContract(name, memberName, deviceName)
    await entity.init()
    return entity
  }

  toStringObj() {
    return {
      ...super.toStringObj(),
      networkName: this.networkName,
      contractAddress: this.contractAddress,
    }
  }

  toJson() {
    return JSON.stringify(this.toStringObj())
  }

  save() {
    localStorage.setItem("entityRegistry_" + this.networkName, this.toJson())
  }
}

export type { AddEntityToList }
export { EthersEntityRegistry }
