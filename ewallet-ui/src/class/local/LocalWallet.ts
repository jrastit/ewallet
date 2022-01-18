import { ethers } from 'ethers'

import { EWalletWallet } from '../model/EWalletWallet'

import { BalanceType } from '../../type/balanceType'
import { SendToApproveType } from '../../type/sendToApproveType'
import { OperationType } from '../../type/operationType'
import { LocalEntity } from './LocalEntity'
import { LocalERC20Info } from './LocalERC20Info'

import { balanceSet, balanceAdd, balanceSub, balanceGte } from '../../type/balanceType'
import { balanceToString, balanceFromString } from '../../type/balanceType'
import { operationToString, operationFromString } from '../../type/operationType'

export interface LocalWalletData {
  blockNumber: string,
  balance: any,
  memberBalanceList: any
  memberAllowanceList: any
  operationList: any,
  sendToApproveList: any[],
  sendToApproveId: number,
}

class LocalWallet extends EWalletWallet {

  getModuleVersion() {
    return '0'
  }

  getModuleContract() {
    return 'LocalWallet'
  }

  blockNumber: ethers.BigNumber
  balance: BalanceType[]
  memberBalanceList: { memberId: number, balance: BalanceType[] }[]
  memberAllowanceList: { memberId: number, allowance: BalanceType[] }[]
  operationList: Array<OperationType>
  sendToApproveId: number
  sendToApproveList: Array<SendToApproveType>
  localEntity?: LocalEntity

  constructor(
    localEntity?: LocalEntity,
    data?: LocalWalletData
  ) {
    super()
    this.localEntity = localEntity
    this.operationList = []
    this.balance = []
    this.memberBalanceList = []
    this.memberAllowanceList = []
    this.sendToApproveId = 0
    this.sendToApproveList = []
    this.blockNumber = ethers.BigNumber.from(0)

    if (data) {
      this.balance = data.balance.map(balanceFromString)
      this.operationList = data.operationList.map(operationFromString).filter((item: any) => item)
      this.memberBalanceList = data.memberBalanceList.map((memberBalance: { memberId: number, balance: any }) => {
        const balance = balanceFromString(memberBalance.balance)
        if (balance) {
          return {
            memberId: memberBalance.memberId,
            balance
          }
        }
      }).filter((item: any) => item)
      this.memberAllowanceList = data.memberAllowanceList.map((memberAllowance: { memberId: number, allowance: any }) => {
        const allowance = balanceFromString(memberAllowance.allowance)
        if (allowance) {
          return {
            memberId: memberAllowance.memberId,
            allowance
          }
        }
      }).filter((item: any) => item)
      this.blockNumber = ethers.BigNumber.from(data.blockNumber)
    }
  }

  toStringObj() {
    return {
      ...super.toStringObj(),
      balance: this.balance.map(balanceToString),
      operationList: this.operationList.map(operationToString),
      memberBalanceList: this.memberBalanceList.map(memberBalance => {
        return {
          memberId: memberBalance.memberId,
          balance: memberBalance.balance.map(balanceToString)
        }
      }),
      memberAllowanceList: this.memberAllowanceList.map(memberAllowance => {
        return {
          memberId: memberAllowance.memberId,
          balance: memberAllowance.allowance.map(balanceToString)
        }
      }),
    }
  }

  toJson() {
    return JSON.stringify(this.toStringObj())
  }

  save() {
    this.localEntity && this.localEntity.save()
  }

  addLog(
    memberId: number,
    message: string,
    category: string,
    balance: Array<BalanceType>
  ) {
    const operation = {
      blockNumber: this.blockNumber,
      memberId,
      message: message,
      category,
      balance,
      date: new Date(),
      temporary: true,
    }
    this.operationList.push(operation)
    return operation
  }

  getLocalEntity(): LocalEntity {
    if (this.localEntity) return this.localEntity
    throw new Error('Local entity is not set')
  }

  async getToken(tokenName: string) {
    return (await this.getLocalEntity().getModuleERC20Info()).getToken(tokenName)
  }

  async getTokenFromAddress(contractAddress: string) {
    const localERC20Info = this.localEntity && this.localEntity.getModule("ERC20Info")
    if (localERC20Info instanceof LocalERC20Info) {
      return localERC20Info.getTokenFromAddress(contractAddress)
    }
    throw ("token " + contractAddress + " not found")
  }

  async getBalance() {
    return this.balance
  }

  async getOperationList(): Promise<OperationType[]> {
    return this.operationList
  }

  async getSendToApproveList(): Promise<SendToApproveType[]> {
    return this.sendToApproveList
  }

  async getMemberBalance(memberId: number): Promise<BalanceType[]> {
    const memberBalanceArray = this.memberBalanceList.filter(memberBalance => memberBalance.memberId === memberId)
    if (memberBalanceArray.length > 0) {
      return memberBalanceArray[0].balance
    } else {
      const balance: BalanceType[] = []
      this.memberBalanceList.push({
        memberId: memberId,
        balance: balance
      })
      return balance
    }
  }

  async getMemberAllowance(memberId: number): Promise<BalanceType[]> {
    const memberAllowanceArray = this.memberAllowanceList.filter(memberAllowance => memberAllowance.memberId === memberId)
    if (memberAllowanceArray.length > 0) {
      return memberAllowanceArray[0].allowance
    } else {
      const balance: BalanceType[] = []
      this.memberAllowanceList.push({
        memberId: memberId,
        allowance: balance
      })
      return balance
    }
  }

  async depositFund(
    memberId: number,
    amount: string,
    tokenName: string,
  ) {
    const token = await this.getToken(tokenName)
    const amountBN = ethers.utils.parseUnits(amount, token.decimal)
    if (amountBN.lte(0)) {
      throw new Error("Amount should be a positive value")
    }
    const balance = [{ token: token.name, balance: amountBN }]
    balanceAdd(this.balance, balance)
    balanceAdd(await this.getMemberBalance(memberId), balance)
    const operation = this.addLog(
      memberId,
      "Deposit of fund",
      "funding",
      balance,
    )
    this.save()
    return [operation]
  }

  async withdrawFund(
    memberId: number,
    amount: string,
    tokenName: string,
  ) {
    const token = await this.getToken(tokenName)
    const amountBN = ethers.utils.parseUnits(amount, token.decimal)
    if (amountBN.lte(0)) {
      throw new Error("Amount should be a positive value")
    }
    const balance = [{ token: token.name, balance: amountBN }]
    if (balanceGte(this.balance, balance)) {
      const memberBalance = await this.getMemberBalance(memberId)
      if (balanceGte(memberBalance, balance)) {
        balanceSub(memberBalance, balance)
        balanceSub(this.balance, balance)
        const operation = this.addLog(
          memberId,
          "Withdraw of fund",
          "funding",
          [{ token: token.name, balance: ethers.BigNumber.from(0).sub(amountBN) }],
        )
        this.save()
        return [operation]
      } else {
        throw new Error("Not enought member fund")
      }
    } else {
      throw new Error("Not enought fund")
    }
  }

  async send(
    memberId: number,
    to: string,
    amount: string,
    tokenName: string,
    name: string,
    reason: string,
  ) {
    const token = await this.getToken(tokenName)
    const amountBN = ethers.utils.parseUnits(amount, token.decimal)
    if (amountBN.lte(0)) {
      throw new Error("Amount should be a positive value")
    }
    const balance = [{ token: token.name, balance: amountBN }]
    if (balanceGte(this.balance, balance)) {
      const memberAllowance = await this.getMemberAllowance(memberId)
      if (balanceGte(memberAllowance, balance)) {
        balanceSub(memberAllowance, balance)
        balanceSub(this.balance, balance)
        console.log("Send to " + to)
        const operation = this.addLog(
          memberId,
          name + " : " + reason,
          "debit",
          [{ token: token.name, balance: ethers.BigNumber.from(0).sub(amountBN) }],
        )
        this.save()
        return [operation]
      } else {
        throw new Error("Not enought member allowance")
      }
    } else {
      throw new Error("Not enought fund")
    }
  }

  async sendToApprove(
    memberId: number,
    to: string,
    amount: string,
    tokenName: string,
    name: string,
    reason: string,
  ) {
    const token = await this.getToken(tokenName)
    const amountBN = ethers.utils.parseUnits(amount, token.decimal)
    if (amountBN.lte(0)) {
      throw new Error("Amount should be a positive value")
    }
    this.sendToApproveId++
    this.sendToApproveList.push({
      id: this.sendToApproveId,
      initiator: memberId,
      to,
      tokenName,
      value: amountBN,
      name,
      reason,
    })
  }

  async setAllowance(
    memberId: number,
    amount: string,
    tokenName: string,
  ) {
    const token = await this.getToken(tokenName)
    const amountBN = ethers.utils.parseUnits(amount, token.decimal)
    if (amountBN.lt(0)) {
      throw new Error("Amount should be a positive value")
    }
    const memberAllowance = await this.getMemberAllowance(memberId)
    balanceSet(memberAllowance, [{ token: token.name, balance: amountBN }])
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
    if (amountBN.lte(0)) {
      throw new Error("Amount should be a positive value")
    }
    const balance = [{ token: token.name, balance: amountBN }]
    balanceAdd(this.balance, balance)
    console.log("Pay from " + from)
    const operation = this.addLog(
      memberId,
      name + " : " + reason,
      "credit",
      balance,
    )
    this.save()
    return [operation]
  }
}

export { LocalWallet }
