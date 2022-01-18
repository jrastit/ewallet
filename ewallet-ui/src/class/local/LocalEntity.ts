import { Entity } from '../model/Entity'
import { EWalletModule } from '../model/EWalletModule'
import { LocalEntityRegistry } from './LocalEntityRegistry'
import { LocalModule } from './LocalModule'
import { LocalMember } from './LocalMember'
import { LocalWallet } from './LocalWallet'
import { LocalERC20Info } from './LocalERC20Info'

interface ModuleLocalSave {
  moduleName: string,
  moduleVersion: string,
  moduleContract: string,
}

interface LocalEntityData {
  name: string | undefined,
  moduleList?: (ModuleLocalSave & any)[]
}

class LocalEntity extends Entity {

  entityRegistry?: LocalEntityRegistry
  moduleList: Array<EWalletModule>
  name?: string

  constructor(
    entityRegistry?: LocalEntityRegistry,
    data?: LocalEntityData
  ) {
    super()
    this.entityRegistry = entityRegistry
    this.moduleList = []
    if (data) {
      this.name = data.name
      if (data.moduleList) {
        this.moduleList = data.moduleList.map(moduleSave => {
          switch (moduleSave.moduleContract) {
            case 'LocalMember': {
              return new LocalMember(this, moduleSave)
            }
            case 'LocalWallet': {
              return new LocalWallet(this, moduleSave)
            }
            case 'LocalERC20Info': {
              return new LocalERC20Info(this, moduleSave)
            }
            default:
              throw new Error('module not found')
          }
        })
      }

    }
  }

  toStringObj() {
    return {
      ...super.toStringObj(),
      name: this.name,
      module: this.moduleList.map(module => module.toStringObj())

    }
  }

  toJson() {
    return JSON.stringify(this.toStringObj())
  }

  save() {
    localStorage.setItem("network_local_entity_" + this.name, this.toJson())
  }

  async getName() {
    return this.name
  }

  async addModule(module: LocalModule) {
    const moduleInList = this.moduleList.filter(moduleItem => { module.getModuleName() === moduleItem.getModuleName() })
    if (moduleInList.length > 0) {
      const moduleInList2 = this.moduleList.filter(moduleItem => { module === moduleItem })
      if (moduleInList2.length == 0) {
        this.moduleList = this.moduleList.map(moduleItem => {
          if (module.getModuleName() === moduleItem.getModuleName()) {
            return module
          }
          return moduleItem
        })
      }
    } else {
      this.moduleList.push(module)
    }
  }

  async getModuleList() {
    return this.moduleList
  }

  async getModule(moduleName: string) {
    for (let i = 0; i < this.moduleList.length; i++) {
      if (this.moduleList[i].getModuleName() === moduleName) {
        return this.moduleList[i]
      }
    }
  }

  async getMemberIdFromAddress(address: string) {
    const module = await this.getMemberModule()
    if (module instanceof LocalMember) {
      return await module.getMemberIdFromAddress(address)
    } else {
      throw new Error("module member is not set")
    }
  }

  async getMemberModule() {
    const module = await this.getModule("member")
    if (module instanceof LocalMember) {
      return module
    } else {
      throw new Error("module member is not set")
    }
  }

  async getModuleWallet() {
    const module = await this.getModule("wallet")
    if (module instanceof LocalWallet) {
      return module
    } else {
      throw new Error("module wallet is not set")
    }
  }

  async getModuleERC20Info() {
    const module = await this.getModule("ERC20Info")
    if (module instanceof LocalERC20Info) {
      return module
    } else {
      throw new Error("module ERC20Info is not set")
    }
  }

  async update() {
    this.moduleList.forEach(module => {
      module.update && module.update()
    })
  }

  async getInfoTxt(): Promise<string> {
    let txt = "LocalEntity\n"
    return txt
  }

}


export type { LocalEntityData }
export { LocalEntity }
