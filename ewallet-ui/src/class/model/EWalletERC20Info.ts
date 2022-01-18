import { TokenType } from '../../type/tokenType'
import { EWalletModule } from './EWalletModule'

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
      const token = (await this.getTokenList()).filter(token => token.name === tokenName)
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
      console.log(await this.getTokenList())
      const token = (await this.getTokenList()).filter(token => token.contractAddress === contractAddress)
      if (token.length === 1) {
        return token[0]
      }
    }
    throw new Error("Token not found '" + contractAddress + "'")
  }

  async getTokenList?(

  ): Promise<TokenType[]>

  update?(): Promise<void>
}

export { EWalletERC20Info }
