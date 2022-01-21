import { LocalERC20Info, LocalERC20InfoData } from '../local/LocalERC20Info'
import { EthersEntity } from './EthersEntity'
import { TokenType } from '../../type/tokenType'

import { ethers } from 'ethers'

import { TransactionManager } from '../../util/TransactionManager'
import { getTransactionManagerEntity, getContract } from '../../util/ethersGeneric'

import {
  getContractEWalletERC20Info,
  createWithManagerContractEWalletERC20Info
} from '../../contract/solidity/compiled/contractAutoFactory'

class EthersERC20Info extends LocalERC20Info {

  getModuleVersion() {
    return '0'
  }

  getModuleContract() {
    return 'EWalletERC20Info'
  }

  entity?: EthersEntity

  contract: ethers.Contract | undefined
  contractAddress?: string
  transactionManager?: TransactionManager

  constructor(
    entity?: EthersEntity,
    data?: LocalERC20InfoData,
    props?: {
      transactionManager?: TransactionManager,
      contractAddress?: string,
    }
  ) {
    super(entity, data)
    this.entity = entity
    if (props) {
      this.contractAddress = props.contractAddress
      this.transactionManager = props.transactionManager
    }
  }

  getTransactionManager(transactionManager?: TransactionManager) {
    return getTransactionManagerEntity(this, transactionManager)
  }

  getContract() {
    return getContract(this, getContractEWalletERC20Info)
  }

  async newContract() {
    if (this.entity) {
      this.contract = await createWithManagerContractEWalletERC20Info(this.entity.getContract(), this.getTransactionManager())
      this.contractAddress = this.contract.address
    }
    return this
  }

  async init() {
    await this.update()
    return this
  }

  tokenChainToToken(tokenChain: {
    token: string,
    symbol: string,
    name: string,
    decimals: number,
  }): TokenType {
    return {
      name: tokenChain.name,
      symbol: tokenChain.symbol,
      decimal: tokenChain.decimals,
      niceName: tokenChain.name,
      contractAddress: tokenChain.token,
      networkName: ''
    }
  }

  async update() {
    this.tokenList = (await this.getContract().getERC20TokenList()).map(this.tokenChainToToken)
    const chainToken = await this.getContract().getMainToken()
    if (chainToken.name) {
      this.tokenList.push(this.tokenChainToToken(chainToken))
    } else {
      this.tokenList.push({
        name: 'eth',
        symbol: 'ETH',
        decimal: 18,
        niceName: 'eth',
        contractAddress: ethers.constants.AddressZero,
        networkName: '',
      })
    }
    //console.log(this.tokenList)
  }

  async setRole(memberId: number, manageToken: boolean) {
    await this.getTransactionManager().sendTx(
      await this.getContract().populateTransaction.setRole(memberId, manageToken),
      'Set Role'
    )
  }

  async addERC20Token(
    tokenAddress: string,
    symbol: string,
    name: string,
    decimal: number,
  ) {
    await this.getTransactionManager().sendTx(
      await this.getContract().populateTransaction.addERC20Token(
        tokenAddress,
        symbol,
        name,
        decimal
      ),
      "Add ERC20 Token"
    )
  }

  toStringObj() {
    return {
      ...super.toStringObj(),
      contractAddress: this.contractAddress,
    }
  }

  async getInfoTxt(): Promise<string> {
    let txt = "EWalletERC20Info contract address:\n"
    if (this.contract) {
      txt += this.contract.address + "\n"
    }
    return txt
  }
}

export { EthersERC20Info }
