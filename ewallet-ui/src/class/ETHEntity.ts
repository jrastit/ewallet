import { LocalEntity } from './LocalEntity'
import { EntityRegistry } from './EntityRegistry'

import { MemberType } from '../type/memberType'
import { TokenType } from '../type/tokenType'
import { DeviceType } from '../type/deviceType'
import { BalanceType } from '../type/balanceType'

import { ethers } from 'ethers'

import {
  createWalletContract,
  getWalletContract,
  getMemberContract,
} from '../contract/contractFactory'

class ETHEntity extends LocalEntity {

  contract?: ethers.Contract
  contractMember?: ethers.Contract
  contractAddress?: string
  contractMemberAddress?: string
  signer: ethers.Signer

  memberName?: string
  deviceName?: string

  entityRegistry?: EntityRegistry

  constructor(
    props: {
      name?: string | undefined,
      networkName: string,
      signer: ethers.Signer,

      address?: string,
      memberName?: string,
      deviceName?: string,

      contractAddress?: string,
      entityRegistry?: EntityRegistry,

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
    this.entityRegistry = props.entityRegistry

  }

  async init() {

    if (this.entityRegistry && this.name && this.memberName && this.deviceName) {

      this.contractAddress = await this.entityRegistry.createEntity(this.name, this.memberName, this.deviceName)
      console.log("contractAddress" + this.contractAddress)

    }
    if (!this.contractAddress && !this.entityRegistry && this.name && this.memberName && this.deviceName) {

      this.contract = await createWalletContract(this.name, this.memberName, this.deviceName, this.signer)

      console.log("contractAddress" + this.contract.address)

      this.contractAddress = this.contract.address
      this.contractMember = await getMemberContract(this.contract, this.signer);
      this.save()
    } else if (this.contractAddress) {
      this.contract = await getWalletContract(this.contractAddress, this.signer)
      this.contractMember = await getMemberContract(this.contract, this.signer);
      if (this.contractMember) {
        console.log("contractMember", this.contractMember.address)
      }
      await this.update()
    } else {
      throw new Error("Entity init fail")
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
    if (this.contractMember) {
      const deviceListChainPromise = []
      for (let i = 1; i <= deviceIdChain; i++) {
        deviceListChainPromise.push(this.contractMember.deviceList(memberId, i))
      }
      return (await (Promise.all(deviceListChainPromise))).map((deviceChain): DeviceType => {
        return {
          name: deviceChain.name,
          walletAddress: deviceChain.walletAddress,
          disable: deviceChain.disable,
        }
      })
    }
    return []
  }

  async updateBalance() {
    if (this.signer.provider && this.contractAddress) {
      const ethBalance = await this.signer.provider.getBalance(this.contractAddress)
      return [{
        balance: ethBalance,
        token: 'eth',
      }]
    }
    return []

  }

  async update() {
    if (this.contract && this.contractMember) {
      this.name = await this.contract.name()
      this.balance = await this.updateBalance();

      const memberListChain = await this.contractMember.getMemberList()

      console.log(memberListChain)

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
        let balance: BalanceType[] = []
        let allowance: BalanceType[] = []
        let device: DeviceType[] = []
        if (this.contract) {
          balance = await this.contract.getMemberBalance(memberId);
          console.log("balance", balance)
          allowance = await this.contract.getMemberAllowance(memberId);
        }
        if (this.contractMember) {
          device = await this.contractMember.getDeviceList(memberId);
        }
        return {
          disable: memberChain.disable,
          memberId,
          memberName: memberChain.name,
          role: [
            {
              name: "manageAllowance",
              value: memberChain.role.manageAllowance
            },
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
          balance,
          allowance,
          device,
        }
      }))

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

    if (this.contractMember) {
      await this.contractMember.addMember(memberName, deviceName, memberWallet)
    }

    this.save()
  }

  async addDeviceForMemberId(
    memberId: number,
    name: string,
    address: string,
  ) {
    await super.addDeviceForMemberId(
      memberId,
      name,
      address,
    )
    if (this.contractMember) {
      await this.contractMember.addSelfDevice(name, address)
    }
  }

  async depositFund(
    memberId: number,
    amount: string,
    tokenName: string,
  ) {
    await super.depositFund(
      memberId,
      amount,
      tokenName
    )
    const token = await this.getToken(tokenName)
    const amountBN = ethers.utils.parseUnits(amount, token.decimal)
    if (token.name === 'eth') {
      if (this.contract) {
        const tx = await this.contract.depositETH({ value: amountBN })
        await tx.wait()
      }
    }
    this.update()
  }

  async withdrawFund(
    memberId: number,
    amount: string,
    tokenName: string,
  ) {
    await super.withdrawFund(
      memberId,
      amount,
      tokenName
    )
    const token = await this.getToken(tokenName)
    const amountBN = ethers.utils.parseUnits(amount, token.decimal)

    if (token.name === 'eth') {
      if (this.contract) {
        const tx = await this.contract.withdrawETH(amountBN)
        await tx.wait()
      }
    }
    this.update()
  }

  async setAllowance(
    memberId: number,
    amount: string,
    tokenName: string,
  ) {
    await super.setAllowance(
      memberId,
      amount,
      tokenName
    )
    const token = await this.getToken(tokenName)
    const amountBN = ethers.utils.parseUnits(amount, token.decimal)
    if (token.name === 'eth') {
      if (this.contract) {
        const tx = await this.contract.allowanceETH(amountBN, memberId)
        await tx.wait()
      }
    }
    this.update()
  }

  async send(
    memberId: number,
    to: string,
    amount: string,
    tokenName: string,
    name: string,
    reason: string,
  ) {
    await super.send(
      memberId,
      to,
      amount,
      tokenName,
      name,
      reason,
    )
    const token = await this.getToken(tokenName)
    const amountBN = ethers.utils.parseUnits(amount, token.decimal)
    if (token.name === 'eth') {
      if (this.contract) {
        const tx = await this.contract.sendETH(to, amountBN, name, reason)
        await tx.wait()
      }
    }
    this.update()
  }

  async sendToApprove(
    memberId: number,
    to: string,
    amount: string,
    tokenName: string,
    name: string,
    reason: string,
  ) {
    await super.sendToApprove(
      memberId,
      to,
      amount,
      tokenName,
      name,
      reason,
    )
    const token = await this.getToken(tokenName)
    const amountBN = ethers.utils.parseUnits(amount, token.decimal)
    if (token.name === 'eth') {
      if (this.contract) {
        const tx = await this.contract.sendETHToApprove(to, amountBN, name, reason)
        await tx.wait()
      }
    }
    this.update()
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
    await super.pay(
      memberId,
      from,
      amount,
      tokenName,
      name,
      reason,
    )
    if (token.name === 'eth') {
      if (this.contract) {
        const tx = await this.contract.receiveETH(name, reason, { value: amountBN })
        await tx.wait()
      }
    }
    this.update()
  }
}

export { ETHEntity }
