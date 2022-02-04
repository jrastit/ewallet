import { OperationType } from '../type/operationType'
import { SendToApproveType } from '../type/sendToApproveType'
import { BalanceType } from '../type/balanceType'
import { EWalletModule } from '../../../contract/model/EWalletModule'
import { Entity } from '../../../contract/model/Entity'
import { TokenType } from '../../erc20Info/type/tokenType'

export interface EWalletWalletRole {
  allowanceManager: boolean
}

class EWalletWallet extends EWalletModule {

  getModuleName() {
    return "wallet"
  }

  constructor() {
    super()
    if (this.constructor === EWalletWallet) {
      throw new TypeError('Abstract class "EWalletWallet" cannot be instantiated directly');
    }
  }

  async getOperationList?(

  ): Promise<OperationType[]>

  async getSendToApproveList(): Promise<SendToApproveType[]> {
    throw new Error('You must implement this function');
  }

  getEntity?(): Promise<Entity>

  getBalance?(): Promise<BalanceType[]>

  depositFund?(
    memberId: number,
    amount: string,
    tokenName: string
  ): Promise<OperationType[]>

  withdrawFund?(
    memberId: number,
    amount: string,
    tokenName: string
  ): Promise<OperationType[]>

  send?(
    memberId: number,
    to: string,
    amount: string,
    tokenName: string,
    name: string,
    reason: string,
  ): Promise<OperationType[]>

  sendToApprove?(
    memberId: number,
    to: string,
    amount: string,
    tokenName: string,
    name: string,
    reason: string,
  ): Promise<void>

  setAllowance?(
    memberId: number,
    amount: string,
    tokenName: string,
  ): Promise<void>

  pay?(
    memberId: number,
    amount: string,
    tokenName: string,
    name: string,
    reason: string,
    address: string,
  ): Promise<OperationType[]>

  getToken?(
    tokenName: string
  ): Promise<TokenType>

  getTokenList?(
  ): Promise<TokenType[]>

  update?(): Promise<void>
}

export { EWalletWallet }
