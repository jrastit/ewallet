import { LocalEntity } from './LocalEntity'

import { MemberType } from '../type/memberType'
import { TokenType } from '../type/tokenType'
import { DeviceType } from '../type/deviceType'

import { ethers } from 'ethers'


import bytecodePath from '../contract/solidity/bin/contract_solidity_EWallet_sol_EWallet.bin'
import abiPath from '../contract/solidity/bin/contract_solidity_EWallet_sol_EWallet.abi'

class ETHEntity extends LocalEntity {

  contract?: ethers.Contract
  contractAddress?: string
  signer: ethers.Signer

  memberName?: string
  deviceName?: string

  constructor(
    props: {
      name: string,
      networkName: string,
      signer: ethers.Signer,

      address?: string,
      memberName?: string,
      deviceName?: string,

      contractAddress?: string,

      balance?: any,
      blockNumber?: string,
      operationList?: any,
      memberId?: number,
      memberList?: any,
      tokenList?: Array<TokenType>,
    }
  ) {
    super(
      props
    )

    this.contractAddress = props.contractAddress ? props.contractAddress : ""
    this.signer = props.signer
    this.deviceName = props.deviceName
    this.memberName = props.memberName

  }

  async init() {

    const abi = await (await fetch(abiPath)).text()

    if (!this.contractAddress) {

      const bytecode = await (await fetch(bytecodePath)).text()


      console.log("bytecode", bytecode)
      console.log("abi", abi)

      const factory = new ethers.ContractFactory(abi, bytecode, this.signer)

      this.contract = await factory.deploy(this.memberName, this.deviceName)

      await this.contract.deployed()

      console.log("contractAddress" + this.contract.address)

      this.contractAddress = this.contract.address
      this.save()
    } else {
      this.contract = new ethers.Contract(this.contractAddress, abi, this.signer)
      await this.update()

    }
    return this
  }

  toString() {
    return {
      ...super.toString(),
      contractAddress: this.contractAddress,
    }
  }

  async loadDeviceForMember(
    memberId: number,
    deviceIdChain: number
  ) {
    if (this.contract) {
      const deviceListChainPromise = []
      for (let i = 1; i <= deviceIdChain; i++) {
        deviceListChainPromise.push(this.contract.deviceList(memberId, i))
      }
      return (await (Promise.all(deviceListChainPromise))).map((deviceChain): DeviceType => {
        return {
          name: deviceChain.name,
          address: deviceChain.walletAddress,
          disable: deviceChain.disable,
        }
      })
    }
    return []
  }

  async update() {
    if (this.contract) {
      const memberListChainPromise = []
      const memberIdChain = await this.contract.memberId()
      for (let i = 1; i <= memberIdChain; i++) {
        memberListChainPromise.push(this.contract.memberList(i))
      }
      const memberListChain = await Promise.all(memberListChainPromise)
      let id = 0
      this.memberList = await Promise.all(
        memberListChain.map(
          async (memberChain): Promise<MemberType> => {
            id++
            return {
              memberId: id,
              memberName: memberChain.name as string,
              disable: memberChain.disable as boolean,
              device: await this.loadDeviceForMember(id, memberChain.deviceId),
              balance: [],
            }
          }
        )
      )
      this.memberId = memberIdChain
    }
    console.log("loaded memberList ", this.memberList)

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

    if (this.contract) {
      await this.contract.addMember(memberName, deviceName, memberWallet)
    }

    this.save()
  }

  async addDeviceForMemberId(
    memberId: number,
    name: string,
    address: string,
  ) {
    super.addDeviceForMemberId(
      memberId,
      name,
      address,
    )
    if (this.contract) {
      await this.contract.addSelfDevice(name, address)
    }
  }
}

export { ETHEntity }
