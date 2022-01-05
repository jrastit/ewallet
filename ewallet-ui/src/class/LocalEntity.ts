import { Entity } from './Entity'

import { SendToApproveType } from '../type/sendToApproveType'
import { OperationType } from '../type/operationType'
import { MemberType } from '../type/memberType'
import { TokenType } from '../type/tokenType'
import { BalanceType } from '../type/balanceType'
import { balanceAdd, balanceSub, balanceGte } from '../type/balanceType'
import { balanceToString, balanceFromString } from '../type/balanceType'
import { operationToString, operationFromString } from '../type/operationType'
import { memberToString, memberFromString } from '../type/memberType'

import { ethers } from 'ethers'

class LocalEntity extends Entity {

  balance: BalanceType[]

  blockNumber: ethers.BigNumber

  operationList: Array<OperationType>

  sendToApproveList: Array<SendToApproveType>

  memberIdLast: number

  sendToApproveId: number

  memberList: Array<MemberType>

  networkName: string

  tokenList: Array<TokenType>

  constructor(
    props: {
      name?: string | undefined,
      networkName: string,

      address?: string,
      memberName?: string,
      deviceName?: string,

      balance?: any,
      blockNumber?: string,
      operationList?: any,
      memberIdLast?: number,
      sendToApproveId?: number,
      memberList?: any,
      tokenList?: Array<TokenType>,
    }
  ) {
    super(
      props.name
    )
    this.networkName = props.networkName
    this.operationList = []
    this.balance = []
    this.blockNumber = ethers.BigNumber.from(0)
    this.memberIdLast = 0
    this.sendToApproveId = 0
    this.memberList = []
    this.sendToApproveList = []
    this.tokenList = [{
      name: 'eth',
      niceName: 'ether',
      symbol: 'ETH',
      decimal: 18,
      networkName: props.networkName,
      contractAddress: "0x0000000000000000000000000000000000000000",
    }, {
      name: 'dai',
      niceName: 'dai',
      symbol: 'DAI',
      decimal: 18,
      networkName: props.networkName,
    }, {
      name: 'tether',
      niceName: 'tether',
      symbol: 'USDT',
      decimal: 6,
      networkName: props.networkName,
    }]
    if (props.address && props.memberName && props.deviceName) {
      this.addMember(
        props.address,
        props.memberName,
        props.deviceName,
      )
      this.addLog(
        0,
        "Create entity",
        "entity",
        []
      )
      this.save()
    } else if (
      props.balance &&
      props.blockNumber &&
      props.operationList &&
      props.memberIdLast &&
      props.memberList &&
      props.tokenList
    ) {
      this.balance = props.balance.map(balanceFromString)
      this.blockNumber = ethers.BigNumber.from(props.blockNumber)
      this.operationList = props.operationList.map(operationFromString)
      this.memberIdLast = props.memberIdLast
      this.memberList = props.memberList.map(memberFromString)
      this.tokenList = props.tokenList
    }
  }

  toString() {
    return {
      ...super.toString(),
      networkName: this.networkName,
      tokenList: this.tokenList,
      blockNumber: this.blockNumber.toString(),
      balance: this.balance.map(balanceToString),
      operationList: this.operationList.map(operationToString),
      memberIdLast: this.memberIdLast,
      memberList: this.memberList.map(memberToString),
    }
  }

  toJson() {
    return JSON.stringify(this.toString())
  }

  save() {
    localStorage.setItem("network_" + this.networkName + "_entity_" + this.name, this.toJson())
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

  async getBalance() {
    return this.balance
  }

  async getTokenList(): Promise<TokenType[]> {
    return this.tokenList
  }

  async getOperationList(): Promise<OperationType[]> {
    return this.operationList
  }

  async getSendToApproveList(): Promise<SendToApproveType[]> {
    return this.sendToApproveList
  }

  async getMemberList(): Promise<MemberType[]> {
    return this.memberList
  }

  async addMember(
    memberWallet: string,
    memberName: string,
    deviceName: string,
  ) {
    if (this.memberList.filter(
      member => member.memberName === memberName
    ).length > 0) {
      throw new Error("Member with the same name already present")
    }

    this.memberList.map(member => {
      if (member.device.filter(
        device => device.walletAddress === memberWallet
      ).length > 0) {
        throw new Error("Wallet address already registered")
      }
      return member
    })

    this.memberIdLast = this.memberIdLast + 1

    this.memberList.push({
      memberId: this.memberIdLast,
      memberName,
      balance: [],
      allowance: [],
      device: [],
      disable: false,
    })
    this.save()
    try {
      await this._addDeviceForMemberId(this.memberIdLast, deviceName, memberWallet)
      this.save()
    } catch (err) {
      throw err
    }
  }

  async _addDeviceForMemberId(
    memberId: number,
    name: string,
    address: string,
  ) {
    const walletAddress = ethers.utils.getAddress(address)
    this.memberList.map(member => {
      if (member.device.filter(
        device => device.walletAddress === address
      ).length > 0) {
        throw new Error("Wallet address already registered")
      }
      return member
    })
    const member = await this.getMemberFromId(memberId)
    if (member.device.filter(
      device => device.name === name
    ).length > 0) {
      throw new Error("Device name already used")
    }
    member.device.push({
      name,
      walletAddress,
      disable: false,
    })
  }

  async addSelfDevice(
    memberId: number,
    name: string,
    address: string,
  ) {
    this._addDeviceForMemberId(
      memberId,
      name,
      address,
    )
    this.save()
  }

  async disableMemberFromMemberId(
    memberId: number,
    disable: boolean
  ) {
    const member = await this.getMemberFromId(memberId)
    member.disable = disable
    this.save()
  }

  async disableDeviceFromMemberIdAndAddress(
    memberId: number,
    address: string,
    disable: boolean
  ) {
    const member = await this.getMemberFromId(memberId)
    member.device.filter(
      device => device.walletAddress === address
    ).forEach((device) => {
      device.disable = disable
      this.save()
    })
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
    const member = await this.getMemberFromId(memberId)
    balanceAdd(member.balance, balance)
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
      const member = await this.getMemberFromId(memberId)
      if (balanceGte(member.balance, balance)) {
        balanceSub(member.balance, balance)
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
      const member = await this.getMemberFromId(memberId)
      if (balanceGte(member.allowance, balance)) {
        balanceSub(member.allowance, balance)
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
    const member = await this.getMemberFromId(memberId)
    member.allowance = [{ token: token.name, balance: amountBN }]
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

  async getInfoTxt(): Promise<string> {
    let txt = "LocalEntity\n"
    return txt
  }

}



export { LocalEntity }
