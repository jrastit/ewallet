import { TokenType } from '../type/tokenType'
import { BalanceType } from '../type/balanceType'
import { OperationType } from '../type/operationType'
import { SendToApproveType } from '../type/sendToApproveType'
import { MemberType } from '../type/memberType'
import { DeviceType } from '../type/deviceType'

class Entity {

  name?: string
  version: number
  setVersion?: (version: number) => void

  constructor(
    name: string | undefined,
  ) {
    if (this.constructor === Entity) {
      throw new TypeError('Abstract class "Entity" cannot be instantiated directly');
    }
    this.name = name
    this.version = 0
  }

  toString() {
    return ({ name: this.name })
  }

  async init() {
    return this
  }

  incVersion() {
    this.version += 1
    if (this.setVersion) {
      this.setVersion(this.version)
    }
  }

  getBalance?(): Promise<BalanceType[]>

  async getToken(
    tokenName: string
  ): Promise<TokenType> {
    if (this.getTokenList) {
      const token = (await this.getTokenList()).filter(token => token.name === tokenName)
      if (token.length === 1) {
        return token[0]
      }
    }
    throw new Error("Token not found '" + tokenName + "'")
  }

  async getTokenFromAddress(
    contractAddress: string
  ): Promise<TokenType> {
    if (this.getTokenList) {
      const token = (await this.getTokenList()).filter(token => token.contractAddress === contractAddress)
      if (token.length === 1) {
        return token[0]
      }
    }
    throw new Error("Token not found '" + contractAddress + "'")
  }

  async getTokenList?(

  ): Promise<TokenType[]>

  async getOperationList?(

  ): Promise<OperationType[]>

  async getSendToApproveList(): Promise<SendToApproveType[]> {
    throw new Error('You must implement this function');
  }

  async getMemberList(): Promise<MemberType[]> {
    throw new Error('You must implement this function');
  }

  async getMemberIdFromAddress(
    address: string,
  ) {
    const memberList = await this.getMemberList()
    for (let i = 0; i < memberList.length; i++) {
      for (let j = 0; j < memberList[i].device.length; j++) {
        if (memberList[i].device[j].walletAddress === address) {
          if (memberList[i].device[j].disable) {
            throw new Error("This device wallet key is disable")
          }
          if (memberList[i].disable) {
            throw new Error("This member is disable")
          }
          const memberId: number = memberList[i].memberId
          return memberId
        }
      }
    }
    throw new Error("Address not found in entity")
  }

  async getMemberFromId(
    memberId: number,
  ) {
    const memberList = await this.getMemberList()
    for (let i = 0; i < memberList.length; i++) {
      if (memberList[i].memberId === memberId) {
        return memberList[i]
      }
    }
    throw new Error("Member not found")
  }

  async getDeviceListFromMemberId(
    memberId: number,
  ): Promise<DeviceType[]> {
    const member = await this.getMemberFromId(memberId)
    return member.device
  }

  addMember?(
    memberWallet: string,
    memberName: string,
    deviceName: string,
  ): Promise<void>

  addSelfDevice?(
    memberId: number,
    name: string,
    address: string,
  ): Promise<void>

  depositFund?(
    memberId: number,
    amount: string,
    tokenName: string
  ): Promise<OperationType[]>

  withdrawFund?(
    memberId: number,
    amount: string,
    tokenName: string
  ): Promise<OperationType[]>

  send?(
    memberId: number,
    to: string,
    amount: string,
    tokenName: string,
    name: string,
    reason: string,
  ): Promise<OperationType[]>

  sendToApprove?(
    memberId: number,
    to: string,
    amount: string,
    tokenName: string,
    name: string,
    reason: string,
  ): Promise<void>

  setAllowance?(
    memberId: number,
    amount: string,
    tokenName: string,
  ): Promise<void>

  pay?(
    memberId: number,
    amount: string,
    tokenName: string,
    name: string,
    reason: string,
    address: string,
  ): Promise<OperationType[]>

  update?(): void
  getInfoTxt?(): Promise<string>
}

export { Entity }
