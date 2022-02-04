import { EWalletMember, EWalletMemberRole } from './EWalletMember'
import { MemberType } from '../type/memberType'
import { LocalEntity } from '../../../contract/local/LocalEntity'
import { getRole, setRole } from '../../../util/localGeneric'

import { memberToString, memberFromString } from '../type/memberType'

export interface LocalMemberData {
  memberIdLast: number,
  memberList: any,
}

class LocalMember extends EWalletMember {

  getModuleVersion() {
    return '0'
  }

  getModuleContract() {
    return 'LocalMember'
  }

  memberIdLast: number
  memberList: Array<MemberType>
  localEntity?: LocalEntity
  role: { memberId: number, role: EWalletMemberRole }[] = []

  constructor(
    localEntity?: LocalEntity,
    data?: LocalMemberData
  ) {
    super()
    this.memberIdLast = 0
    this.memberList = []
    this.localEntity = localEntity

    if (data) {
      this.memberIdLast = data.memberIdLast
      this.memberList = data.memberList.map(memberFromString)
    }
  }

  toStringObj() {
    return {
      ...super.toStringObj(),
      memberIdLast: this.memberIdLast,
      memberList: this.memberList.map(memberToString),
    }
  }

  toJson() {
    return JSON.stringify(this.toStringObj())
  }

  save() {
    this.localEntity && this.localEntity.save()
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
      device: [],
      disable: false,
    })
    try {
      await this._addDeviceForMemberId(this.memberIdLast, deviceName, memberWallet)
    } catch (err) {
      throw err
    }
  }

  async _addDeviceForMemberId(
    memberId: number,
    name: string,
    address: string,
  ) {
    //const walletAddress = ethers.utils.getAddress(address)
    const walletAddress = address
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
    this.save()
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

  async getRole(memberId: number) {
    return await getRole<EWalletMemberRole>(this, memberId)
  }

  async setRole(memberId: number, role: EWalletMemberRole) {
    return await setRole<EWalletMemberRole>(this, memberId, role)
  }

}

export { LocalMember }
