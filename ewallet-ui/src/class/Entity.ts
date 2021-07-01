import { TokenType } from '../type/tokenType'
import { BalanceType } from '../type/balanceType'
import { OperationType } from '../type/operationType'
import { UserType } from '../type/userType'
import { DeviceType } from '../type/deviceType'

class Entity {

  name: string

  constructor(
    name: string,
  ) {
    if (this.constructor === Entity) {
      throw new TypeError('Abstract class "Entity" cannot be instantiated directly');
    }
    this.name = name
  }

  toString() {
    return ({ name: this.name })
  }

  async init() {
    return this
  }

  async getBalance(): Promise<BalanceType[]> {
    throw new Error('You must implement this function');
  }

  async getToken(
    tokenName: string
  ): Promise<TokenType> {
    const token = (await this.getTokenList()).filter(token => token.name === tokenName)
    if (token.length === 1) {
      return token[0]
    }
    throw new Error("Token not found '" + tokenName + "'")
  }

  async getTokenList(): Promise<TokenType[]> {
    throw new Error('You must implement this function');
  }

  async getOperationList(): Promise<OperationType[]> {
    throw new Error('You must implement this function');
  }

  async getUserList(): Promise<UserType[]> {
    throw new Error('You must implement this function');
  }

  async getUserIdFromAddress(
    address: string,
  ) {
    const userList = await this.getUserList()

    for (let i = 0; i < userList.length; i++) {
      for (let j = 0; j < userList[i].device.length; j++) {
        if (userList[i].device[j].address === address) {
          if (userList[i].device[j].disable) {
            throw new Error("This device wallet key is disable")
          }
          const userId: number = userList[i].userId
          return userId
        }
      }
    }
    throw new Error("Address not found")
  }

  async getUserFromId(
    userId: number,
  ) {
    const userList = await this.getUserList()
    for (let i = 0; i < userList.length; i++) {
      if (userList[i].userId === userId) {
        return userList[i]
      }
    }
    throw new Error("User not found")
  }

  async getDeviceListFromUserId(
    userId: number,
  ): Promise<DeviceType[]> {
    const user = await this.getUserFromId(userId)
    return user.device
  }

  async addUser(
    userWallet: string,
    userName: string,
    deviceName: string,
  ) {
    throw new Error('You must implement this function');
  }

  async addDeviceForUserId(
    userId: number,
    name: string,
    address: string,
  ) {
    throw new Error('You must implement this function');
  }

  async depositFund(
    userId: number,
    amount: string,
    tokenName: string,
  ) {
    throw new Error('You must implement this function');
  }

  async withdrawFund(
    userId: number,
    amount: string,
    tokenName: string,
  ) {
    throw new Error('You must implement this function');
  }

  async pay(
    userId: number,
    amount: string,
    tokenName: string,
    name: string,
    subject: string,
    address: string,
  ) {
    throw new Error('You must implement this function');
  }


}

export { Entity }
