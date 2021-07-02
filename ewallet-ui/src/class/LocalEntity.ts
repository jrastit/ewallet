import { Entity } from './Entity'

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

  memberId: number

  memberList: Array<MemberType>

  networkName: string

  tokenList: Array<TokenType>

  constructor(
    props: {
      name: string,
      networkName: string,

      address?: string,
      memberName?: string,
      deviceName?: string,

      balance?: any,
      blockNumber?: string,
      operationList?: any,
      memberId?: number,
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
    this.memberId = 0
    this.memberList = []
    this.tokenList = [{
      name: 'eth',
      niceName: 'ether',
      symbol: 'ETH',
      decimal: 18,
      networkName: props.networkName,
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
      props.memberId &&
      props.memberList &&
      props.tokenList
    ) {
      this.balance = props.balance.map(balanceFromString)
      this.blockNumber = ethers.BigNumber.from(props.blockNumber)
      this.operationList = props.operationList.map(operationFromString)
      this.memberId = props.memberId
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
      memberId: this.memberId,
      memberList: this.memberList.map(memberToString),
    }
  }

  toJson() {
    return JSON.stringify(this.toString())
  }

  save() {
    localStorage.setItem("entity", this.toJson())
  }

  addLog(
    memberId: number,
    message: string,
    category: string,
    balance: Array<BalanceType>
  ) {
    this.operationList.push({
      blockNumber: this.blockNumber,
      memberId,
      message,
      category,
      balance,
      date: new Date()
    })
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
        device => device.address === memberWallet
      ).length > 0) {
        throw new Error("Wallet address already registered")
      }
      return member
    })

    this.memberId = this.memberId + 1

    this.memberList.push({
      memberId: this.memberId,
      memberName,
      balance: [],
      device: [],
      disable: false,
    })
    try {
      await this.addDeviceForMemberId(this.memberId, deviceName, memberWallet)
    } catch (err) {
      throw err
    }


    this.save()
  }

  async addDeviceForMemberId(
    memberId: number,
    name: string,
    address: string,
  ) {
    address = ethers.utils.getAddress(address)
    this.memberList.map(member => {
      if (member.device.filter(
        device => device.address === address
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
      address,
      disable: false,
    })
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
      device => device.address === address
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
    this.addLog(
      memberId,
      "Deposit of fund",
      "funding",
      balance,
    )
    this.save()
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
        this.addLog(
          memberId,
          "Withdraw of fund",
          "funding",
          [{ token: token.name, balance: ethers.BigNumber.from(0).sub(amountBN) }],
        )
        this.save()
      } else {
        throw new Error("Not enought member fund")
      }
    } else {
      throw new Error("Not enought fund")
    }
  }

  async pay(
    memberId: number,
    amount: string,
    tokenName: string,
    name: string,
    subject: string,
    address: string,
  ) {
    const token = await this.getToken(tokenName)
    const amountBN = ethers.utils.parseUnits(amount, token.decimal)
    if (amountBN.lte(0)) {
      throw new Error("Amount should be a positive value")
    }
    const balance = [{ token: token.name, balance: amountBN }]
    balanceAdd(this.balance, balance)
    this.addLog(
      memberId,
      name + " : " + subject,
      "credit",
      balance,
    )
    this.save()
  }

}



export { LocalEntity }
