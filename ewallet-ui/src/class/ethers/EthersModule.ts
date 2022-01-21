import { getContractIEWalletModule } from '../../contract/solidity/compiled/contractAutoFactory'
import { LocalModule, LocalModuleData } from '../local/LocalModule'
import * as ethers from 'ethers'
import { EthersEntity } from './EthersEntity'

import { TransactionManager } from '../../util/TransactionManager'
import { getTransactionManagerEntity, getContract } from '../../util/ethersGeneric'

class EthersModule extends LocalModule {

  entity?: EthersEntity

  contract?: ethers.Contract
  contractAddress?: string
  transactionManager?: TransactionManager

  constructor(
    entity?: EthersEntity,
    data?: LocalModuleData,
    props?: {
      transactionManager?: TransactionManager,
      contractAddress?: string,
    }
  ) {
    super(
      entity,
      data
    )
    this.entity = entity
    if (props) {
      this.transactionManager = props.transactionManager
      this.contractAddress = props.contractAddress
    }
  }

  getTransactionManager(transactionManager?: TransactionManager) {
    return getTransactionManagerEntity(this, transactionManager)
  }

  getContract() {
    return getContract(this, getContractIEWalletModule)
  }

  toStringObj() {
    return {
      ...super.toStringObj(),
      contractAddress: this.contractAddress,
    }
  }

  async init() {
    await this.update()
    return this
  }

  async update() {
    this.moduleName = await this.getContract().moduleName()
    this.moduleVersion = await this.getContract().moduleVersion()
    this.moduleContract = await this.getContract().moduleContract()
  }

}

export { EthersModule }
