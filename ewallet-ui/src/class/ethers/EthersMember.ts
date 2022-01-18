import { LocalMember, LocalMemberData } from '../local/LocalMember'
import { EthersEntity } from './EthersEntity'

import { MemberType } from '../../type/memberType'
import { DeviceType } from '../../type/deviceType'

import { getSignerEntity, getContract } from '../../util/ethersGeneric'

import { ethers } from 'ethers'

import {
  getContractEWalletMember,
} from '../../contract/solidity/compiled/contractAutoFactory'

export class EthersMember extends LocalMember {

  getModuleVersion() {
    return '0'
  }

  getModuleContract() {
    return 'EWalletMember'
  }

  entity?: EthersEntity

  contract?: ethers.Contract
  contractAddress?: string
  signer?: ethers.Signer

  constructor(
    entity?: EthersEntity,
    data?: LocalMemberData,
    props?: {
      signer?: ethers.Signer,
      contractAddress?: string,
    }
  ) {
    super(
      entity,
      data
    )
    this.entity = entity
    if (props) {
      this.signer = props.signer
      this.contractAddress = props.contractAddress
    }
  }

  getSigner(signer?: ethers.Signer) {
    return getSignerEntity(this, signer)
  }

  getContract() {
    return getContract(this, getContractEWalletMember)
  }

  toStringObj() {
    return {
      ...super.toStringObj(),
      contractAddress: this.contractAddress,
    }
  }

  async init() {
    await this.update()
    return this
  }

  async loadDeviceForMember(
    memberId: number,
    deviceIdChain: number
  ) {
    const deviceListChainPromise = []
    for (let i = 1; i <= deviceIdChain; i++) {
      deviceListChainPromise.push(this.getContract().deviceList(memberId, i))
    }
    return (await (Promise.all(deviceListChainPromise))).map((deviceChain): DeviceType => {
      return {
        name: deviceChain.name,
        walletAddress: deviceChain.walletAddress,
        disable: deviceChain.disable,
      }
    })
  }

  async update() {
    const memberListChain = await this.getContract().getMemberList()

    this.memberList = await Promise.all<MemberType[]>(memberListChain.map(async (memberChain: {
      name: string,
      role: {
        manageAllowance: boolean,
        manageDevice: boolean,
        manageMember: boolean,
        manageRole: boolean,
        manageSelfDevice: boolean,
        manageSelfMember: boolean,
      },
      disable: boolean,
      deviceId: number,
    }, memberId: number): Promise<MemberType> => {
      let device: DeviceType[] = []
      if (this.getContract()) {
        device = (await this.getContract().getDeviceList(memberId)).map((device: DeviceType) => {
          return {
            disable: device.disable,
            name: device.name,
            walletAddress: device.walletAddress,
          }
        })
      }
      return {
        disable: memberChain.disable,
        memberId,
        memberName: memberChain.name,
        role: [
          {
            name: "manageDevice",
            value: memberChain.role.manageDevice
          },
          {
            name: "manageMember",
            value: memberChain.role.manageMember
          },
          {
            name: "manageRole",
            value: memberChain.role.manageRole
          },
          {
            name: "manageSelfDevice",
            value: memberChain.role.manageSelfDevice
          },
          {
            name: "manageSelfMember",
            value: memberChain.role.manageSelfMember
          },
        ],
        device,
      }
    }))
  }

  async addMember(
    memberWallet: string,
    memberName: string,
    deviceName: string,
  ) {
    await super.addMember(
      memberWallet,
      memberName,
      deviceName
    )
    await this.getContract().addMember(
      memberName,
      deviceName,
      memberWallet
    )
  }

  async addDeviceForMemberId(
    memberId: number,
    name: string,
    address: string,
  ) {
    await super.addSelfDevice(
      memberId,
      name,
      address,
    )
    await this.getContract().addSelfDevice(
      name,
      address
    )
  }

  async getInfoTxt(): Promise<string> {
    let txt = "EthersMember contract address:\n"
    if (this.getContract()) {
      txt += this.getContract().address + "\n"
    }
    return txt
  }
}
