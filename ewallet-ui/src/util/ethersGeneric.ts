import { ethers } from 'ethers'
import { EthersEntity } from '../class/ethers/EthersEntity'
import { EthersEntityRegistry } from '../class/ethers/EthersEntityRegistry'

export const getContract = (
  item: {
    contract?: ethers.Contract
    contractAddress?: string
    getSigner: (signer?: ethers.Signer) => ethers.Signer
  },
  getContract: (constractAddress: string, signer: ethers.Signer) => ethers.Contract
): ethers.Contract => {
  if (item.contract) return item.contract
  if (item.contractAddress) {
    item.contract = getContract(item.contractAddress, item.getSigner())
    return item.contract
  }
  throw new Error("contract not found")
}

export const getSignerEntityRegistry = (
  item: {
    signer?: ethers.Signer
    contract?: ethers.Contract
    entityRegistry?: EthersEntityRegistry
  },
  signer?: ethers.Signer,
): ethers.Signer => {
  return getSigner(item, signer, () => {
    if (item.entityRegistry ?.signer) return item.entityRegistry.signer
    if (item.entityRegistry ?.contract) return item.entityRegistry.contract.signer
  })
}

export const getSignerEntity = (
  item: {
    signer?: ethers.Signer
    contract?: ethers.Contract
    entity?: EthersEntity
  },
  signer?: ethers.Signer,
): ethers.Signer => {
  return getSigner(item, signer, () => {
    if (item.entity ?.signer) return item.entity.signer
    if (item.entity ?.contract) return item.entity.contract.signer
    if (item.entity ?.entityRegistry ?.signer) return item.entity.entityRegistry.signer
    if (item.entity ?.entityRegistry ?.contract) return item.entity.entityRegistry.contract.signer
  })
}

export const getSigner = (
  item: {
    signer?: ethers.Signer
    contract?: ethers.Contract
  },
  signer?: ethers.Signer,
  getOtherSigner?: () => ethers.Signer | undefined
): ethers.Signer => {
  if (signer) return signer
  if (item.signer) return item.signer
  if (item.contract ?.signer) return item.contract.signer
  if (getOtherSigner) {
    const signer = getOtherSigner()
    if (signer) return signer
  }
  throw new Error("signer not found")
}
