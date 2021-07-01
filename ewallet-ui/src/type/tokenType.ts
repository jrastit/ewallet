import { ethers } from 'ethers'

type TokenType = {
  name: string
  niceName: string
  symbol: string
  decimal: number
  contractAddress?: string
  networkName: string
}

export type {
  TokenType,
}
