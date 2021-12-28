import { ethers } from 'ethers'

type WalletInfo = {
  type: string | undefined
  name: string | undefined,
  networkName: string | undefined,
  address: string,
  wallet: ethers.Wallet | undefined,
  error: string | undefined
}

export type { WalletInfo }
