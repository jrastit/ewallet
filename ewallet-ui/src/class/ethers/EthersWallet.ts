import { LocalWallet, LocalWalletData } from '../local/LocalWallet'
import { EthersEntity } from './EthersEntity'

import { ethers } from 'ethers'

import { getSignerEntity, getContract } from '../../util/ethersGeneric'

import {
  getContractEWalletWallet,
  createContractEWalletWallet,
} from '../../contract/solidity/compiled/contractAutoFactory'

export class EthersWallet extends LocalWallet {

  getModuleVersion() {
    return '0'
  }

  getModuleContract() {
    return 'EthersWallet'
  }

  entity?: EthersEntity

  contract: ethers.Contract | undefined
  contractAddress?: string
  signer?: ethers.Signer

  constructor(
    entity?: EthersEntity,
    data?: LocalWalletData,
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
    return getContract(this, getContractEWalletWallet)
  }

  async init() {
    this.addListener()
    await this.loadAllOperation()
    await this.update()
    return this
  }

  addListener() {
    if (this.getContract().listenerCount("Operation") === 0) {
      this.getContract().on("Operation", (memberId: number, from: string, to: string, tokenAddress: string, value: ethers.BigNumber, name: string, reason: string, extra: any) => {
        this.addOperation(memberId, from, to, tokenAddress, value, name, reason, extra)
      })
    }
  }

  async newContract(signer?: ethers.Signer) {
    if (this.entity && this.entity.contract) {
      this.contract = await createContractEWalletWallet(this.entity.contract, this.getSigner(signer))
      this.contractAddress = this.contract.address
    }
    return this
  }

  toStringObj() {
    return {
      ...super.toStringObj(),
      contractAddress: this.contractAddress,
    }
  }

  async updateBalance() {
    const provider = this.getSigner().provider
    if (provider && this.contractAddress) {
      const ethBalance = await provider.getBalance(this.contractAddress)
      return [{
        balance: ethBalance,
        token: 'eth',
      }]
    }
    return []

  }

  async contractBalanceToBalance(balanceChainList: { token: string, balance: ethers.BigNumber }[]) {
    return await Promise.all(balanceChainList.map(
      async (balanceChain) => {
        return {
          token: (await this.getTokenFromAddress(balanceChain.token)).name,
          balance: balanceChain.balance,
        }
      }
    ))
  }

  async addOperation(
    memberId: number,
    from: string,
    to: string,
    tokenAddress: string,
    value: ethers.BigNumber,
    name: string,
    reason: string,
    extra: any
  ) {
    if (this.operationList.filter(operation =>
      operation.blockNumber.eq(extra.blockNumber) &&
      operation.txIndex === extra.txIndex &&
      operation.logIndex === extra.logIndex).length === 0) {
      this.operationList = this.operationList.filter((operation) => !operation.temporary)
      this.operationList.push({
        from: from,
        to: to,
        txHash: extra.transactionHash,
        txIndex: extra.transactionIndex,
        logIndex: extra.logIndex,
        blockNumber: ethers.BigNumber.from(extra.blockNumber),
        memberId: memberId,
        message: name + " : " + reason,
        category: "operation",
        date: new Date((await extra.getBlock()).timestamp),
        balance: [{
          balance: value,
          token: (await this.getTokenFromAddress(tokenAddress)).name
        }]
      })
      this.entity && this.entity.incVersion()
    }
  }

  async loadAllOperation() {
    await Promise.all((
      await this.getContract().queryFilter(
        this.getContract().filters.Operation())
    ).map(async (operationChain: ethers.Event) => {
      if (!operationChain.args) throw new Error("invalid argument in event")
      this.addOperation(
        operationChain.args._memebrId,
        operationChain.args._from,
        operationChain.args._to,
        operationChain.args._tokenAddress,
        operationChain.args._value,
        operationChain.args._name,
        operationChain.args._reason,
        operationChain,
      )
    }))
  }

  async update() {
    this.balance = await this.updateBalance();
    this.entity && this.entity.incVersion()
  }

  async depositFund(
    memberId: number,
    amount: string,
    tokenName: string,
  ) {
    const operationList = await super.depositFund(
      memberId,
      amount,
      tokenName
    )
    const token = await this.getToken(tokenName)
    const amountBN = ethers.utils.parseUnits(amount, token.decimal)
    if (token.name === 'eth') {
      const tx = await this.getContract().depositETH({ value: amountBN })
      await tx.wait()
    }
    await this.update()
    return operationList
  }

  async withdrawFund(
    memberId: number,
    amount: string,
    tokenName: string,
  ) {
    const operationList = await super.withdrawFund(
      memberId,
      amount,
      tokenName
    )
    const token = await this.getToken(tokenName)
    const amountBN = ethers.utils.parseUnits(amount, token.decimal)

    if (token.name === 'eth') {
      const tx = await this.getContract().withdrawETH(amountBN)
      await tx.wait()
    }
    await this.update()
    return operationList
  }

  async setRole(memberId: number, allowanceManager: boolean) {
    const tx = await this.getContract().setRole(memberId, allowanceManager)
    await tx.wait()
  }

  async setAllowance(
    memberId: number,
    amount: string,
    tokenName: string,
  ) {
    await super.setAllowance(
      memberId,
      amount,
      tokenName
    )
    const token = await this.getToken(tokenName)
    const amountBN = ethers.utils.parseUnits(amount, token.decimal)
    if (token.name === 'eth') {
      const tx = await this.getContract().allowanceETH(amountBN, memberId)
      await tx.wait()
    }
    await this.update()
  }

  async send(
    memberId: number,
    to: string,
    amount: string,
    tokenName: string,
    name: string,
    reason: string,
  ) {
    const operationList = await super.send(
      memberId,
      to,
      amount,
      tokenName,
      name,
      reason,
    )
    const token = await this.getToken(tokenName)
    const amountBN = ethers.utils.parseUnits(amount, token.decimal)
    if (token.name === 'eth') {
      const tx = await this.getContract().sendETH(to, amountBN, name, reason)
      await tx.wait()
    }
    this.update()
    return operationList
  }

  async sendToApprove(
    memberId: number,
    to: string,
    amount: string,
    tokenName: string,
    name: string,
    reason: string,
  ) {
    await super.sendToApprove(
      memberId,
      to,
      amount,
      tokenName,
      name,
      reason,
    )
    const token = await this.getToken(tokenName)
    const amountBN = ethers.utils.parseUnits(amount, token.decimal)
    if (token.name === 'eth') {
      const tx = await this.getContract().sendETHToApprove(to, amountBN, name, reason)
      await tx.wait()
    }
    this.update()
  }

  async pay(
    memberId: number,
    from: string,
    amount: string,
    tokenName: string,
    name: string,
    reason: string,
  ) {
    const token = await this.getToken(tokenName)
    const amountBN = ethers.utils.parseUnits(amount, token.decimal)
    const operationList = await super.pay(
      memberId,
      from,
      amount,
      tokenName,
      name,
      reason,
    )
    if (token.name === 'eth') {
      const tx = await this.getContract().receiveETH(name, reason, { value: amountBN })
      await tx.wait()
    }
    this.update()
    return operationList
  }

  async getInfoTxt(): Promise<string> {
    let txt = this.constructor.name + " contract address:\n"
    txt += this.getContract().address + "\n"
    return txt
  }
}
