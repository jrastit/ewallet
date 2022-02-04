import { EWalletMember } from '../../module/member/contract/EWalletMember'
import { EWalletWallet } from '../../module/wallet/contract/EWalletWallet'
import { EWalletERC20Info } from '../../module/erc20Info/contract/EWalletERC20Info'
import { EWalletModule } from './EWalletModule'

interface EntityRole {
  manageModule: boolean,
}

class Entity {

  version: number = 0
  setVersion?: (version: number) => void

  constructor() {
    if (this.constructor === Entity) {
      throw new TypeError('Abstract class "Entity" cannot be instantiated directly');
    }
  }

  toStringObj() {
    return ({

    })
  }

  async init() {
    return this
  }

  incVersion() {
    this.version += 1
    if (this.setVersion) {
      this.setVersion(this.version)
    }
  }
  getName(): Promise<string | undefined>

  async getName() {
    return undefined
  }
  update(): Promise<void>

  async update() {

  }

  setRole?(memberId: number, role: EntityRole): Promise<void>

  getRole?(memberId: number): Promise<EntityRole | undefined>

  getMemberIdFromAddress?(address: string): Promise<number>

  getModuleERC20Info?(): Promise<EWalletERC20Info>

  getModuleWallet?(): Promise<EWalletWallet>

  getModuleMember?(): Promise<EWalletMember>

  getModuleList?(): Promise<EWalletModule[]>

  addModuleWallet?(): Promise<void>

  getInfoTxt?(): Promise<string>
}

export type { EntityRole }
export { Entity }
