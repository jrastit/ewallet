
type NetworkType = {
  name: string
  url: string
  chainId: number
  blockExplorerTxPrefix?: string
  faucet?: string
  entityRegistryAddress?: string
  contractDomainChainlink?: {
    linkAddress: string,
    oracle: string,
    jobId: string,
  }
}

export type { NetworkType }
