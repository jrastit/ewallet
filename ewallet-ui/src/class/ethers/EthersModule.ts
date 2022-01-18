import { getContractIEWalletModule } from '../../contract/solidity/compiled/contractAutoFactory'
import { LocalModule, LocalModuleData } from '../local/LocalModule'
import * as ethers from 'ethers'
import { EthersEntity } from './EthersEntity'
import { getSignerEntity, getContract } from '../../util/ethersGeneric'

class EthersModule extends LocalModule {

  entity?: EthersEntity

  contract?: ethers.Contract
  contractAddress?: string
  signer?: ethers.Signer

  constructor(
    entity?: EthersEntity,
    data?: LocalModuleData,
    props?: {
      signer?: ethers.Signer,
      contractAddress?: string,
    }
  ) {
    super(
      entity,
      data
    )
    this.entity = entity
    if (props) {
      this.signer = props.signer
      this.contractAddress = props.contractAddress
    }
  }

  getSigner(signer?: ethers.Signer) {
    return getSignerEntity(this, signer)
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
