import { EntityRegistry } from '../model/EntityRegistry'
import { LocalEntity, LocalEntityData } from '../local/LocalEntity'
import { EWalletModule } from '../model/EWalletModule'
import { LocalModule } from '../local/LocalModule'
import { EthersEntityRegistry } from './EthersEntityRegistry'
import { EthersModule } from './EthersModule'
import { EthersMember } from '../../module/member/contract/EthersMember'
import { EthersWallet } from '../../module/wallet/contract/EthersWallet'
import { EthersERC20Info } from '../../module/erc20Info/contract/EthersERC20Info'
import { EthersModuleAdmin } from './EthersModuleAdmin'
import { EntityRole } from '../model/Entity'

import { ethers } from 'ethers'

import { TransactionManager } from '../../util/TransactionManager'
import { getTransactionManagerEntityRegistry, getContract } from '../../util/ethersGeneric'

import {
  createWalletContract,
} from '../../contract/contractFactory'

import {
  getContractEWallet,
} from '../../contract/solidity/compiled/contractAutoFactory'

class EthersEntity extends LocalEntity {

  networkName?: string
  contract?: ethers.Contract
  contractAddress?: string
  transactionManager?: TransactionManager
  moduleAdminAddress?: string
  moduleAdmin?: EthersModuleAdmin

  entityRegistry?: EthersEntityRegistry


  constructor(
    entityRegistry?: EntityRegistry,
    data?: LocalEntityData,
    props?: {
      networkName?: string,
      transactionManager?: TransactionManager,
      contractAddress?: string,
      currentUserId?: number[]
    }
  ) {
    super(
      entityRegistry,
      data
    )
    if (entityRegistry instanceof EthersEntityRegistry) {
      this.entityRegistry = entityRegistry
    }
    if (props) {
      this.contractAddress = props.contractAddress
      this.transactionManager = props.transactionManager
      this.networkName = props.networkName
      if (props.currentUserId) {
        this.currentUserId = props.currentUserId
      }
    }
  }

  async getCurrentUserId() {
    if (this.currentUserId.length > 0)
      return this.currentUserId
    return super.getCurrentUserId()
  }

  getTransactionManager(transactionManager?: TransactionManager) {
    return getTransactionManagerEntityRegistry(this, transactionManager)
  }

  getContract() {
    return getContract(this, getContractEWallet)
  }

  getModuleAdmin() {
    if (this.moduleAdmin) return this.moduleAdmin
    throw new Error("moduleAdmin not set")
  }

  async newContract(name: string, memberName: string, deviceName: string) {
    this.contract = await createWalletContract(name, memberName, deviceName, this.getTransactionManager())
    this.contractAddress = this.contract.address
    return this
  }

  async init() {
    await this.update()
    return this
  }

  toStringObj() {
    return {
      ...super.toStringObj(),
      networkName: this.networkName,
      contractAddress: this.contractAddress,
    }
  }

  async getModuleFromName(moduleName: string): Promise<EthersModule | undefined> {
    if (this.getContract()) {
      const contractAddress = await this.getContract().getModule(moduleName)
      const module = await super.getModule(moduleName)
      if (module &&
        module.getModuleName() === moduleName &&
        module instanceof EthersModule) {
        return module
      } else {
        const module = new EthersModule(this, undefined, { contractAddress })
        await module.init()
        switch (module.getModuleContract()) {
          case 'EWalletMember': {
            return await (new EthersMember(this, undefined, { contractAddress })).init()
          }
          case 'EWalletERC20Info': {
            return await (new EthersERC20Info(this, undefined, { contractAddress })).init()
          }
          case 'EWalletWallet': {
            return await (new EthersWallet(this, undefined, { contractAddress })).init()
          }
          default: {
            return module
          }
        }
      }
    }
  }

  async addModule(module: EWalletModule & { contract: ethers.Contract | undefined }) {
    await super.addModule(module)
    if (module.contract) {
      await this.getTransactionManager().sendTx(
        await (this.getContract().populateTransaction.addModule(module.contract.address)),
        'add module'
      )
    }
    await this.update()
  }

  async addModuleRaw(address: string) {
    await this.getTransactionManager().sendTx(
      await (this.getContract().populateTransaction.addModule(address)),
      'add module raw'
    )
    await this.update()
  }

  async addModuleWallet() {
    if (await this.getModule("ERC20Info") === undefined) {
      await this.addModuleERC20Info()
    }
    await this.getModuleAdmin().addModuleEWalletWallet(this)
  }

  async addModuleENS() {
    await this.getModuleAdmin().addModuleEWalletENS(this)
  }

  async addModuleERC20Info() {
    if (await this.getModule("ENS") === undefined) {
      await this.addModuleENS()
    }
    await this.getModuleAdmin().addModuleEWalletERC20Info(this)
  }

  async getModuleMember(): Promise<EthersMember> {
    const module = await super.getModuleMember()
    if (module instanceof EthersMember) {
      return module
    } else {
      throw new Error("module member is not set")
    }
  }

  async getModuleWallet(): Promise<EthersWallet> {
    const module = await super.getModuleWallet()
    if (module instanceof EthersWallet) {
      return module
    } else {
      throw new Error("module wallet is not set")
    }
  }

  async getModuleERC20Info(): Promise<EthersERC20Info> {
    const module = await super.getModuleERC20Info()
    if (module instanceof EthersERC20Info) {
      return module
    } else {
      throw new Error("module eRC20Info is not set")
    }
  }

  async setRole(memberId: number, role: EntityRole) {
    super.setRole(memberId, role)
    await this.getTransactionManager().sendTx(
      await this.getContract().populateTransaction.setRole(memberId, role.manageModule),
      "set role"
    )
  }

  async updateRole() {
    await Promise.all((await this.getCurrentUserId()).map(async (memberId) => {
      const role = await this.getContract().getRole(memberId)
      super.setRole(memberId, { manageModule: role.manageModule })
    }))
  }

  async updateModuleList() {
    const moduleNameList = await this.getContract().getModuleNameList()
    this.moduleList = (await Promise.all<LocalModule | undefined>(moduleNameList.map(async (moduleName: string) => {
      const module = await this.getModuleFromName(moduleName)
      if (module instanceof EWalletModule) {
        return module
      }
    }))).filter<LocalModule>(
      (moduleItem): moduleItem is EWalletModule => { return moduleItem !== undefined }
    )
  }

  async updateName() {
    this.name = await this.getContract().name()
  }

  async updateModuleAdmin() {
    const moduleAdminAddress = await this.getContract().getModuleAdmin()
    if (!this.moduleAdmin || moduleAdminAddress !== this.moduleAdmin.contractAddress) {
      if (!moduleAdminAddress) {
        this.moduleAdmin = undefined
      } else if (
        this.entityRegistry &&
        this.entityRegistry.moduleAdmin &&
        this.entityRegistry.moduleAdmin.contractAddress === moduleAdminAddress
      ) {
        this.moduleAdmin = this.entityRegistry.moduleAdmin
      } else {
        this.moduleAdmin = new EthersModuleAdmin(this.entityRegistry, { transactionManager: this.getTransactionManager(), contractAddress: moduleAdminAddress })
        await this.moduleAdmin.init()
      }
    }
  }

  async update() {
    console.log("update entity")
    await this.updateName()
    await this.updateModuleList()
    await super.update()
    await this.updateModuleAdmin()
    await this.updateRole()
  }

  save() {
    localStorage.setItem("network_" + this.networkName + "_entity_" + this.name, this.toJson())
  }

  async getInfoTxt(): Promise<string> {
    let txt = "ETHEntity\n"
    txt += "Contract address:\n"
    txt += this.getContract().address + "\n"
    return txt
  }
}

export { EthersEntity }
