import { EWalletWalletRole } from './EWalletWallet'
import { LocalWallet, LocalWalletData } from './LocalWallet'
import { EthersEntity } from '../../../contract/ethers/EthersEntity'

import { ethers } from 'ethers'

import { TransactionManager } from '../../../util/TransactionManager'
import { getTransactionManagerEntity, getContract } from '../../../util/ethersGeneric'

import {
  getContractEWalletWallet,
  createWithManagerContractEWalletWallet,
} from '../../../contract/solidity/compiled/contractAutoFactory'

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
  transactionManager?: TransactionManager

  constructor(
    entity?: EthersEntity,
    data?: LocalWalletData,
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

  async newContract(transactionManager?: TransactionManager) {
    if (this.entity && this.entity.contract) {
      this.contract = await createWithManagerContractEWalletWallet(this.entity.contract, this.getTransactionManager(transactionManager))
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
    const provider = this.getTransactionManager().signer.provider
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
    this.updateRole()
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
      await this.getTransactionManager().sendTx(
        await this.getContract().populateTransaction.depositETH(
          { value: amountBN }
        ),
        'deposit eth'
      )
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
      await this.getTransactionManager().sendTx(
        await this.getContract().populateTransaction.withdrawETH(amountBN),
        'Withdraw eth'
      )
    }
    await this.update()
    return operationList
  }

  async updateRole() {
    if (this.localEntity) {
      await Promise.all((await this.localEntity.getCurrentUserId()).map(async (memberId) => {
        const role = await this.getContract().getRole(memberId)
        super.setRole(memberId, { allowanceManager: role.allowanceManager })
      }))
    }
  }

  async setRole(memberId: number, role: EWalletWalletRole) {
    await this.getTransactionManager().sendTx(
      await this.getContract().populateTransaction.setRole(memberId, role.allowanceManager),
      'Set Role'
    )
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
      await this.getTransactionManager().sendTx(
        await this.getContract().populateTransaction.allowanceETH(amountBN, memberId),
        'set Allowance'
      )
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
      await this.getTransactionManager().sendTx(
        await this.getContract().populateTransaction.sendETH(to, amountBN, name, reason),
        'Send ETH'
      )
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
      await this.getTransactionManager().sendTx(
        await this.getContract().populateTransaction.sendETHToApprove(to, amountBN, name, reason),
        'send eth to approve'
      )
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
      await this.getTransactionManager().sendTx(
        await this.getContract().populateTransaction.receiveETH(
          name,
          reason,
          { value: amountBN }
        ),
        'Receive ETH'
      )
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
