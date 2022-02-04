import { EWalletModule } from '../model/EWalletModule'
import { EthersEntity } from '../ethers/EthersEntity'

export interface LocalModuleData {
  moduleName: string
  moduleVersion: string
  moduleContract: string
}

class LocalModule extends EWalletModule {

  entity?: EthersEntity

  moduleName?: string
  moduleVersion?: string
  moduleContract?: string

  constructor(
    entity?: EthersEntity,
    data?: LocalModuleData
  ) {
    super()
    this.entity = entity;
    if (data) {
      this.moduleName = data.moduleName
      this.moduleVersion = data.moduleVersion
      this.moduleContract = data.moduleContract
    }
  }

  getModuleName() {
    if (this.moduleName) return this.moduleName
    return super.getModuleName()
  }

  getModuleVersion() {
    if (this.moduleVersion) return this.moduleVersion
    return super.getModuleVersion()
  }

  getModuleContract() {
    if (this.moduleContract) return this.moduleContract
    return super.getModuleContract()
  }
}

export { LocalModule }
