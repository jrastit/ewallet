import { LocalEntity } from './LocalEntity'
import { EntityRegistry } from './EntityRegistry'

import { MemberType } from '../type/memberType'
import { TokenType } from '../type/tokenType'
import { BalanceType } from '../type/balanceType'
import { DeviceType } from '../type/deviceType'
import { SendToApproveType } from '../type/sendToApproveType'

import { ethers } from 'ethers'


import bytecodePath from '../contract/solidity/bin/contract_solidity_EWallet_sol_EWallet.bin'
import abiPath from '../contract/solidity/bin/contract_solidity_EWallet_sol_EWallet.abi'

class ETHEntity extends LocalEntity {

  contract?: ethers.Contract
  contractAddress?: string
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

    const abi = await (await fetch(abiPath)).text()

    if (this.entityRegistry && this.name && this.memberName && this.deviceName) {

      this.contractAddress = await this.entityRegistry.createEntity(this.name, this.memberName, this.deviceName)
      console.log("contractAddress" + this.contractAddress)

    }
    if (!this.contractAddress && !this.entityRegistry) {

      const bytecode = await (await fetch(bytecodePath)).text()

      const factory = new ethers.ContractFactory(abi, bytecode, this.signer)

      this.contract = await factory.deploy(this.name, this.memberName, this.deviceName)

      await this.contract.deployed()

      console.log("contractAddress" + this.contract.address)

      this.contractAddress = this.contract.address
      this.save()
    } else if (this.contractAddress) {
      this.contract = new ethers.Contract(this.contractAddress, abi, this.signer)
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
    if (this.contract) {
      this.name = await this.contract.name()
      this.balance = await this.updateBalance();

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
            const role = []
            role.push({
              name: "manageAllowance",
              value: memberChain.role.manageAllowance
            })
            role.push({
              name: "manageDevice",
              value: memberChain.role.manageDevice
            })
            role.push({
              name: "manageMember",
              value: memberChain.role.manageMember
            })
            role.push({
              name: "manageRole",
              value: memberChain.role.manageRole
            })
            role.push({
              name: "manageSelfDevice",
              value: memberChain.role.manageSelfDevice
            })
            role.push({
              name: "manageSelfMember",
              value: memberChain.role.manageSelfMember
            })
            return {
              memberId: id,
              memberName: memberChain.name as string,
              disable: memberChain.disable as boolean,
              device: await this.loadDeviceForMember(id, memberChain.deviceId),
              balance: [{ token: 'eth', balance: memberChain.balanceETH }],
              allowance: [{ token: 'eth', balance: memberChain.allowanceETH }],
              role: role,
            }
          }
        )
      )
      this.memberId = memberIdChain

      const sendToApproveListChainPromise = []
      const sendToApproveIdChain = await this.contract.sendToApproveId()
      for (let i = 1; i <= sendToApproveIdChain; i++) {
        sendToApproveListChainPromise.push(this.contract.sendToApproveList(i))
      }
      const sendToApproveListChain = await Promise.all(sendToApproveListChainPromise)
      id = 0
      this.sendToApproveList = await Promise.all(
        sendToApproveListChain.map(
          async (sendToApproveChain): Promise<SendToApproveType> => {
            id++
            return {
              id: id,
              initiator: sendToApproveChain.initiator,
              validator: sendToApproveChain.validator,
              to: sendToApproveChain.to,
              tokenName: 'eth',
              value: sendToApproveChain.value,
              name: sendToApproveChain.name,
              reason: sendToApproveChain.reason,
            }
          }
        )
      )
      //this.sendToApproveId = this.sendToApproveIdChain

      const eventFilter = this.contract.filters.Operation()
      const operationListChain = await this.contract.queryFilter(eventFilter)
      this.operationList = operationListChain.map(operationChain => {
        if (operationChain.args) {
          return {
            blockNumber: ethers.BigNumber.from(operationChain.blockNumber),
            memberId: operationChain.args._memberId.toNumber(),
            message: operationChain.args._name ?
              operationChain.args._name + ' : ' + operationChain.args._reason :
              operationChain.args._reason,
            category: operationChain.args._reason,
            balance: [{
              token: 'eth',
              balance: operationChain.args._from !== "0x0000000000000000000000000000000000000000" ?
                operationChain.args._value :
                ethers.BigNumber.from(0).sub(operationChain.args._value)
            }],
            date: new Date(),
          }
        }
        return {
          blockNumber: ethers.BigNumber.from(0),
          memberId: 0,
          message: "error",
          category: "error",
          balance: [] as BalanceType[],
          date: new Date(),
        }
      })
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
    await super.addDeviceForMemberId(
      memberId,
      name,
      address,
    )
    if (this.contract) {
      await this.contract.addSelfDevice(name, address)
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
