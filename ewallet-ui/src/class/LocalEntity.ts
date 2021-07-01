import { Entity } from './Entity'

import { OperationType } from '../type/operationType'
import { UserType } from '../type/userType'
import { TokenType } from '../type/tokenType'
import { BalanceType } from '../type/balanceType'
import { balanceAdd, balanceSub, balanceGte } from '../type/balanceType'
import { balanceToString, balanceFromString } from '../type/balanceType'
import { operationToString, operationFromString } from '../type/operationType'
import { userToString, userFromString } from '../type/userType'

import { ethers } from 'ethers'

class LocalEntity extends Entity {

  balance: BalanceType[]

  blockNumber: ethers.BigNumber

  operationList: Array<OperationType>

  userId: number

  userList: Array<UserType>

  networkName: string

  tokenList: Array<TokenType>

  constructor(
    props: {
      name: string,
      networkName: string,

      address?: string,
      userName?: string,
      deviceName?: string,

      balance?: any,
      blockNumber?: string,
      operationList?: any,
      userId?: number
      userList?: any
      tokenList?: Array<TokenType>
    }
  ) {
    super(
      props.name
    )
    this.networkName = props.networkName
    this.operationList = []
    this.balance = []
    this.blockNumber = ethers.BigNumber.from(0)
    this.userId = 0
    this.userList = []
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
    if (props.address && props.userName && props.deviceName) {
      this.addUser(
        props.address,
        props.userName,
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
      props.userId &&
      props.userList &&
      props.tokenList
    ) {
      this.balance = props.balance.map(balanceFromString)
      this.blockNumber = ethers.BigNumber.from(props.blockNumber)
      this.operationList = props.operationList.map(operationFromString)
      this.userId = props.userId
      this.userList = props.userList.map(userFromString)
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
      userId: this.userId,
      userList: this.userList.map(userToString),
    }
  }

  toJson() {
    return JSON.stringify(this.toString())
  }

  save() {
    localStorage.setItem("entity", this.toJson())
  }

  addLog(
    userId: number,
    message: string,
    category: string,
    balance: Array<BalanceType>
  ) {
    this.operationList.push({
      blockNumber: this.blockNumber,
      userId,
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

  async getUserList(): Promise<UserType[]> {
    return this.userList
  }

  async addUser(
    userWallet: string,
    userName: string,
    deviceName: string,
  ) {
    if (this.userList.filter(
      user => user.userName === userName
    ).length > 0) {
      throw new Error("User with the same name already present")
    }

    this.userList.map(user => {
      if (user.device.filter(
        device => device.address === userWallet
      ).length > 0) {
        throw new Error("Wallet address already registered")
      }
      return user
    })

    this.userId = this.userId + 1

    this.userList.push({
      userId: this.userId,
      userName,
      balance: [],
      device: [],
      disable: false,
    })
    try {
      await this.addDeviceForUserId(this.userId, deviceName, userWallet)
    } catch (err) {
      throw err
    }


    this.save()
  }

  async addDeviceForUserId(
    userId: number,
    name: string,
    address: string,
  ) {
    address = ethers.utils.getAddress(address)
    this.userList.map(user => {
      if (user.device.filter(
        device => device.address === address
      ).length > 0) {
        throw new Error("Wallet address already registered")
      }
      return user
    })
    const user = await this.getUserFromId(userId)
    if (user.device.filter(
      device => device.name === name
    ).length > 0) {
      throw new Error("Device name already used")
    }
    user.device.push({
      name,
      address,
      disable: false,
    })
    this.save()
  }

  async disableUserFromUserId(
    userId: number,
    disable: boolean
  ) {
    const user = await this.getUserFromId(userId)
    user.disable = disable
    this.save()
  }

  async disableDeviceFromUserIdAndAddress(
    userId: number,
    address: string,
    disable: boolean
  ) {
    const user = await this.getUserFromId(userId)
    user.device.filter(
      device => device.address === address
    ).forEach((device) => {
      device.disable = disable
      this.save()
    })
  }

  async depositFund(
    userId: number,
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
    const user = await this.getUserFromId(userId)
    balanceAdd(user.balance, balance)
    this.addLog(
      userId,
      "Deposit of fund",
      "funding",
      balance,
    )
    this.save()
  }

  async withdrawFund(
    userId: number,
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
      const user = await this.getUserFromId(userId)
      if (balanceGte(user.balance, balance)) {
        balanceSub(user.balance, balance)
        balanceSub(this.balance, balance)
        this.addLog(
          userId,
          "Withdraw of fund",
          "funding",
          [{ token: token.name, balance: ethers.BigNumber.from(0).sub(amountBN) }],
        )
        this.save()
      } else {
        throw new Error("Not enought user fund")
      }
    } else {
      throw new Error("Not enought fund")
    }
  }

  async pay(
    userId: number,
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
      userId,
      name + " : " + subject,
      "credit",
      balance,
    )
    this.save()
  }

}

const localEntityFromJson = (json: string | null) => {
  if (json)
    return new LocalEntity(JSON.parse(json))
}

const localEntityLoad = () => {
  try {
    return localEntityFromJson(localStorage.getItem("entity"))
  } catch (error) {
    console.error(error)
    localEntityDelete()
  }
}

const localEntityDelete = () => {
  return localStorage.removeItem("entity")
}

export { LocalEntity, localEntityFromJson, localEntityLoad, localEntityDelete }
