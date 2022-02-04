import { ethers } from 'ethers'

import { EWalletWallet, EWalletWalletRole } from './EWalletWallet'
import { LocalEntity } from '../../../contract/local/LocalEntity'
import { LocalERC20Info } from '../../erc20Info/contract/LocalERC20Info'
import { getRole, setRole } from '../../../util/localGeneric'
import { TokenType } from '../../erc20Info/type/tokenType'

import {
  BalanceType,
  balanceSet,
  balanceAdd,
  balanceSub,
  balanceGte,
  balanceToString,
  balanceFromString,
} from '../type/balanceType'
import {
  OperationType,
  operationToString,
  operationFromString,
} from '../type/operationType'
import { SendToApproveType } from '../type/sendToApproveType'

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
  role: { memberId: number, role: EWalletWalletRole }[] = []

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
        return undefined
      }).filter((item: any) => item)
      this.memberAllowanceList = data.memberAllowanceList.map((memberAllowance: { memberId: number, allowance: any }) => {
        const allowance = balanceFromString(memberAllowance.allowance)
        if (allowance) {
          return {
            memberId: memberAllowance.memberId,
            allowance
          }
        }
        return undefined
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

  async getEntity(): Promise<LocalEntity> {
    if (this.localEntity) return this.localEntity
    throw new Error('Local entity is not set')
  }

  async getToken(tokenName: string) {
    try {
      return await (await (await this.getEntity()).getModuleERC20Info()).getToken(tokenName)
    } catch (e: any) {
      console.error("getTokenError", e)
    }
    return {
      name: "Err",
      niceName: "Err",
      decimal: 18,
      symbol: "Err",
      networkName: "Err"
    }

  }

  async getTokenList() {
    return await (await (await this.getEntity()).getModuleERC20Info()).getTokenList()
  }

  async getTokenFromAddress(contractAddress: string): Promise<TokenType> {
    try {
      const localERC20Info = this.localEntity && this.localEntity.getModule("ERC20Info")
      if (localERC20Info instanceof LocalERC20Info) {
        return await localERC20Info.getTokenFromAddress(contractAddress)
      }
    } catch (e: any) {
      console.error("getTokenFromAddressError", e)
    }
    return {
      name: "Err",
      niceName: "Err",
      decimal: 18,
      symbol: "Err",
      networkName: "Err"
    }
    //throw new Error("token " + contractAddress + " not found")
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

  async getRole(memberId: number) {
    return await getRole<EWalletWalletRole>(this, memberId)
  }

  async setRole(memberId: number, role: EWalletWalletRole) {
    return await setRole<EWalletWalletRole>(this, memberId, role)
  }
}

export { LocalWallet }
