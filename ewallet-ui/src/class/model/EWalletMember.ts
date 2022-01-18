import { MemberType } from '../../type/memberType'
import { DeviceType } from '../../type/deviceType'
import { EWalletModule } from './EWalletModule'

class EWalletMember extends EWalletModule {

  getModuleName() {
    return "member"
  }

  constructor() {
    super()
    if (this.constructor === EWalletMember) {
      throw new TypeError('Abstract class "EWalletMember" cannot be instantiated directly');
    }
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

  update?(): Promise<void>
}

export { EWalletMember }
