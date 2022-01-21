import { ethers } from 'ethers'
import { EthersEntity } from '../class/ethers/EthersEntity'
import { EthersEntityRegistry } from '../class/ethers/EthersEntityRegistry'

import { TransactionManager } from './TransactionManager'

export const getContract = (
  item: {
    contract?: ethers.Contract
    contractAddress?: string
    getTransactionManager: (transactionManager?: TransactionManager) => TransactionManager
  },
  getContract: (constractAddress: string, signer: ethers.Signer) => ethers.Contract
): ethers.Contract => {
  if (item.contract) return item.contract
  if (item.contractAddress) {
    item.contract = getContract(item.contractAddress, item.getTransactionManager().signer)
    return item.contract
  }
  throw new Error("contract not found")
}

export const getTransactionManagerEntityRegistry = (
  item: {
    transactionManager?: TransactionManager
    entityRegistry?: EthersEntityRegistry
  },
  transactionManager?: TransactionManager,
): TransactionManager => {
  return getTransactionManager(item, transactionManager, () => {
    if (item.entityRegistry ?.transactionManager) return item.entityRegistry.transactionManager
  })
}

export const getTransactionManagerEntity = (
  item: {
    transactionManager?: TransactionManager
    entity?: EthersEntity
  },
  transactionManager?: TransactionManager,
): TransactionManager => {
  return getTransactionManager(item, transactionManager, () => {
    if (item.entity ?.transactionManager) return item.entity.transactionManager
    if (item.entity ?.entityRegistry ?.transactionManager) return item.entity.entityRegistry.transactionManager
  })
}

export const getTransactionManager = (
  item: {
    transactionManager?: TransactionManager
    contract?: ethers.Contract
  },
  transactionManager?: TransactionManager,
  getOtherSigner?: () => TransactionManager | undefined
): TransactionManager => {
  if (transactionManager) return transactionManager
  if (item.transactionManager) return item.transactionManager
  if (getOtherSigner) {
    const transactionManager = getOtherSigner()
    if (transactionManager) return transactionManager
  }
  throw new Error("transactionManager not found")
}
