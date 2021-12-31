import { ethers } from 'ethers'

type WalletInfo = {
  type?: string
  name?: string
  networkName?: string
  address?: string
  wallet?: ethers.Wallet
  error?: string
}

export type { WalletInfo }
