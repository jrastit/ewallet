import { ethers } from 'ethers'
import { EthersEntity } from './EthersEntity'
import { EthersEntityRegistry } from './EthersEntityRegistry'

import {
  getContractEWalletModuleAdmin,
} from '../../contract/solidity/compiled/contractAutoFactory'

import { TransactionManager } from '../../util/TransactionManager'
import { getTransactionManagerEntityRegistry, getContract } from '../../util/ethersGeneric'

export class EthersModuleAdmin {
  transactionManager?: TransactionManager
  contractAddress?: string
  contract?: ethers.Contract
  entityRegistry?: EthersEntityRegistry

  constructor(
    entityRegistry?: EthersEntityRegistry,
    props?: {
      transactionManager?: TransactionManager,
      contractAddress?: string,

    }
  ) {
    this.entityRegistry = entityRegistry
    if (props) {
      this.transactionManager = props.transactionManager
      this.contractAddress = props.contractAddress
    }
  }

  getTransactionManager(transactionManager?: TransactionManager) {
    return getTransactionManagerEntityRegistry(this, transactionManager)
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
    const confirm: any = await this.getTransactionManager().sendTx(
      await this.getContract().populateTransaction.createEntitySelf(
        name,
        ownerName,
        ownerDeviceName
      ),
      'Create entity self'
    )
    const filterResult = await this.getContract().queryFilter(
      this.getContract().filters.EWalletCreated(),
      confirm.blockNumber,
      confirm.blockNumber
    )
    if (!filterResult) {
      throw new Error('Entity created not found')
    }
    const filterTransaction = filterResult.filter((event) => event.transactionHash === confirm.transactionHash)
    if (!filterTransaction[0].args) {
      throw new Error('Entity created args not found')
    }
    const entityAddress = filterTransaction[0].args.wallet

    const entity = new EthersEntity(this.entityRegistry, undefined, {
      contractAddress: entityAddress
    })
    await entity.init()
    return entity
  }

  async addModuleEWalletWallet(entity: EthersEntity) {
    await this.getTransactionManager().sendTx(
      await this.getContract().populateTransaction.addModuleEWalletWallet(
        entity.getContract().address
      ),
      'Add module EWallet wallet'
    )
    await entity.update()
  }

  async addModuleEWalletERC20Info(entity: EthersEntity) {
    await this.getTransactionManager().sendTx(
      await this.getContract().populateTransaction.addModuleEWalletERC20Info(
        entity.getContract().address
      ),
      'Add module EWallet ERC20Info'
    )
    await entity.update()
  }

  async addModuleEWalletENS(entity: EthersEntity) {
    await this.getTransactionManager().sendTx(
      await this.getContract().populateTransaction.addModuleEWalletENS(
        entity.getContract().address
      ),
      'Add module EWallet ENS'
    )
    await entity.update()
  }

  async update() {

  }
}
