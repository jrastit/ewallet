import { LocalERC20Info, LocalERC20InfoData } from '../local/LocalERC20Info'
import { EthersEntity } from './EthersEntity'
import { TokenType } from '../../type/tokenType'

import { ethers } from 'ethers'

import { getSignerEntity, getContract } from '../../util/ethersGeneric'

import {
  getContractEWalletERC20Info,
  createContractEWalletERC20Info
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
  signer?: ethers.Signer

  constructor(
    entity?: EthersEntity,
    data?: LocalERC20InfoData,
    props?: {
      signer?: ethers.Signer,
      contractAddress?: string,
    }
  ) {
    super(entity, data)
    this.entity = entity
    if (props) {
      this.contractAddress = props.contractAddress
      this.signer = props.signer
    }
  }

  getSigner(signer?: ethers.Signer) {
    return getSignerEntity(this, signer)
  }

  getContract() {
    return getContract(this, getContractEWalletERC20Info)
  }

  async newContract() {
    if (this.entity) {
      this.contract = await createContractEWalletERC20Info(this.entity.getContract(), this.getSigner())
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
    this.tokenList = [(await this.getContract().getERC20TokenList()).map(this.tokenChainToToken)]
    this.tokenList.push(this.tokenChainToToken(await this.getContract().getMainToken()))
    console.log(this.tokenList)
  }

  async setRole(memberId: number, manageToken: boolean) {
    const tx = await this.getContract().setRole(memberId, manageToken)
    await tx.wait()
  }

  async addERC20Token(
    tokenAddress: string,
    symbol: string,
    name: string,
    decimal: number,
  ) {
    await this.getContract().addERC20Token(
      tokenAddress,
      symbol,
      name,
      decimal
    )
    await this.update()
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
