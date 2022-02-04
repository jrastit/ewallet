import { EWalletERC20Info, EWalletERC20InfoRole } from './EWalletERC20Info'
import { LocalEntity } from '../../../contract/local/LocalEntity'
import { TokenType } from '../type/tokenType'
import { getRole, setRole } from '../../../util/localGeneric'

interface LocalERC20InfoData {
  tokenList: Array<TokenType>,
}

export class LocalERC20Info extends EWalletERC20Info {

  getModuleVersion() {
    return '0'
  }

  getModuleContract() {
    return 'LocalERC20Info'
  }

  tokenList: Array<TokenType>
  localEntity?: LocalEntity
  role: { memberId: number, role: EWalletERC20InfoRole }[] = []

  constructor(
    localEntity?: LocalEntity,
    data?: LocalERC20InfoData
  ) {
    super()
    this.localEntity = localEntity
    if (data) {
      this.tokenList = data.tokenList
    } else {
      this.tokenList = [{
        name: 'eth',
        niceName: 'ether',
        symbol: 'ETH',
        decimal: 18,
        networkName: "local",
        contractAddress: "0x0000000000000000000000000000000000000000",
      }, {
        name: 'dai',
        niceName: 'dai',
        symbol: 'DAI',
        decimal: 18,
        networkName: "local",
      }, {
        name: 'tether',
        niceName: 'tether',
        symbol: 'USDT',
        decimal: 6,
        networkName: "local",
      }]
    }
  }

  toStringObj() {
    return {
      ...super.toStringObj(),
      tokenList: this.tokenList,
    }
  }

  toJson() {
    return JSON.stringify(this.toStringObj())
  }

  async getRole(memberId: number) {
    return await getRole<EWalletERC20InfoRole>(this, memberId)
  }

  async setRole(memberId: number, role: EWalletERC20InfoRole) {
    return await setRole<EWalletERC20InfoRole>(this, memberId, role)
  }

  async getTokenList(): Promise<TokenType[]> {
    //console.log('getTokenList')
    return this.tokenList
  }

  save() {
    this.localEntity && this.localEntity.save()
  }

}

export type { LocalERC20InfoData }
