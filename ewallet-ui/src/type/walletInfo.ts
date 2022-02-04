import { TransactionManager } from '../util/TransactionManager'

type WalletInfo = {
  type?: string
  name?: string
  networkName?: string
  address?: string
  transactionManager?: TransactionManager
  error?: string
}

export type { WalletInfo }
