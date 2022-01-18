import { ethers } from 'ethers'
import { EthersEntity } from './EthersEntity'
import { EthersEntityRegistry } from './EthersEntityRegistry'

import {
  getContractEWalletModuleAdmin,
} from '../../contract/solidity/compiled/contractAutoFactory'

import { getSignerEntityRegistry, getContract } from '../../util/ethersGeneric'

export class EthersModuleAdmin {
  signer?: ethers.Signer
  contractAddress?: string
  contract?: ethers.Contract
  entityRegistry?: EthersEntityRegistry

  constructor(
    entityRegistry?: EthersEntityRegistry,
    props?: {
      signer?: ethers.Signer,
      contractAddress?: string,

    }
  ) {
    this.entityRegistry = entityRegistry
    if (props) {
      this.signer = props.signer
      this.contractAddress = props.contractAddress
    }
  }

  getSigner(signer?: ethers.Signer) {
    return getSignerEntityRegistry(this, signer)
  }

  getContract() {
    return getContract(this, getContractEWalletModuleAdmin)
  }


  async init() {
    await this.update()
    return this
  }

  async createEntitySelf(
    name: string,
    ownerName: string,
    ownerDeviceName: string
  ) {
    const tx = await this.getContract().createEntitySelf(name, ownerName, ownerDeviceName)
    const confirm = await tx.wait()
    const entityAddress = confirm.events.filter((event: { event?: string }) => event.event === "EWalletCreated")[0].args.wallet
    const entity = new EthersEntity(this.entityRegistry, undefined, {
      contractAddress: entityAddress
    })
    await entity.init()
    return entity
  }

  async addModuleEWalletWallet(entity: EthersEntity) {
    const tx = await this.getContract().addModuleEWalletWallet(entity.getContract().address)
    await tx.wait()
    await entity.update()
  }

  async addModuleEWalletERC20Info(entity: EthersEntity) {
    const tx = await this.getContract().addModuleEWalletERC20Info(entity.getContract().address)
    await tx.wait()
    await entity.update()
  }

  async addModuleEWalletENS(entity: EthersEntity) {
    const tx = await this.getContract().addModuleEWalletENS(entity.getContract().address)
    await tx.wait()
    await entity.update()
  }

  async update() {

  }
}
