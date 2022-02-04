import { TokenType } from '../type/tokenType'
import { EWalletModule } from '../../../contract/model/EWalletModule'

interface EWalletERC20InfoRole {
  manageToken: boolean
}

class EWalletERC20Info extends EWalletModule {

  getModuleName() {
    return "ERC20Info"
  }

  constructor() {
    super()
    if (this.constructor === EWalletERC20Info) {
      throw new TypeError('Abstract class "EWalletERC20Info" cannot be instantiated directly');
    }
  }

  async getToken(
    tokenName: string
  ): Promise<TokenType> {
    if (this.getTokenList) {
      const tokenList = await this.getTokenList()
      const token = tokenList.filter(token => token.name === tokenName)
      if (token.length === 1) {
        return token[0]
      }
    }
    throw new Error("Token not found '" + tokenName + "'")
  }

  async getTokenFromAddress(
    contractAddress: string
  ): Promise<TokenType> {
    if (this.getTokenList) {
      const tokenList = await this.getTokenList()
      const token = tokenList.filter(token => {
        console.log(token.contractAddress === contractAddress)
        return token.contractAddress === contractAddress
      })
      if (token.length === 1) {
        return token[0]
      }
    }
    throw new Error("Token address not found '" + contractAddress + "'")
  }

  getTokenList?(

  ): Promise<TokenType[]>

  update?(): Promise<void>
}

export type { EWalletERC20InfoRole }
export { EWalletERC20Info }
