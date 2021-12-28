import { LocalEntity } from './LocalEntity'
import { EntityRegistry } from './EntityRegistry'

import { MemberType } from '../type/memberType'
import { TokenType } from '../type/tokenType'
import { DeviceType } from '../type/deviceType'
import { BalanceType } from '../type/balanceType'
import { OperationType } from '../type/operationType'

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
    }
    if (!this.contractAddress && !this.entityRegistry && this.name && this.memberName && this.deviceName) {
      this.contract = await createWalletContract(this.name, this.memberName, this.deviceName, this.signer)
      this.contractAddress = this.contract.address
      this.contractMember = await getMemberContract(this.contract, this.signer);
      this.save()
    } else if (this.contractAddress) {
      this.contract = await getWalletContract(this.contractAddress, this.signer)
      this.contractMember = await getMemberContract(this.contract, this.signer);
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

  async contractBalanceToBalance(balanceChainList: { token: string, balance: ethers.BigNumber }[]) {
    return await Promise.all(balanceChainList.map(
      async (balanceChain) => {
        return {
          token: (await this.getTokenFromAddress(balanceChain.token)).name,
          balance: balanceChain.balance,
        }
      }
    ))
  }

  async update() {
    if (this.contract && this.contractMember) {
      this.name = await this.contract.name()
      this.balance = await this.updateBalance();
      const memberListChain = await this.contractMember.getMemberList()

      this.operationList = await Promise.all((await this.contract.queryFilter(this.contract.filters.Operation())).map(async (operationChain: ethers.Event): Promise<OperationType> => {
        if (!operationChain.args) throw new Error("invalid argument in event")
        let name = operationChain.args._name
        if (operationChain.args._memberId) {
          name = (await this.getMemberFromId(operationChain.args._memberId)).memberName
        }
        return {
          blockNumber: ethers.BigNumber.from(operationChain.blockNumber),
          memberId: operationChain.args._memberId,
          message: name + " : " + operationChain.args._reason,
          category: "operation",
          date: new Date((await operationChain.getBlock()).timestamp),
          balance: [{
            balance: operationChain.args._value,
            token: (await this.getTokenFromAddress(operationChain.args._tokenAddress)).name
          }]
        }

      }))

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
          balance = await this.contractBalanceToBalance(await this.contract.getMemberBalance(memberId))
          allowance = await this.contractBalanceToBalance(await this.contract.getMemberAllowance(memberId))
        }
        if (this.contractMember) {
          device = (await this.contractMember.getDeviceList(memberId)).map((device: DeviceType) => {
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
    await super.addSelfDevice(
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
    await this.update()
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
    await this.update()
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
    await this.update()
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

  async getInfoTxt(): Promise<string> {
    let txt = "ETHEntity\n"
    txt += "Contract address:\n"
    if (this.contract) {
      txt += this.contract.address + "\n"
    }
    txt += "Member contract address:\n"
    if (this.contractMember) {
      txt += this.contractMember.address + "\n"
    }
    return txt
  }
}

export { ETHEntity }
