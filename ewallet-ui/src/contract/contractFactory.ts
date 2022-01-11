import { ethers } from 'ethers'

import {
  createContractEWalletMemberFactory,
  createContractEWalletFactory,
  createContractEWalletRegistry,
  createContractEWalletMember,
  createContractEWallet,
  createContractEWalletDomainChainlink,
} from './solidity/compiled/contractAutoFactory'

export const createEWalletFactoryContract = async (signer: ethers.Signer) => {
  const memberFactoryContract = await createContractEWalletMemberFactory(signer)
  return await createContractEWalletFactory(memberFactoryContract, signer)
}

export const createRegistryContract = async (signer: ethers.Signer) => {
  const eWalletFactoryContract = await createEWalletFactoryContract(signer)
  return await createContractEWalletRegistry(eWalletFactoryContract, signer)
}

export const createWalletContract = async (
  name: string,
  memberName: string,
  deviceName: string,
  signer: ethers.Signer
) => {
  const memberContract = await createContractEWalletMember(
    memberName,
    deviceName,
    signer
  )
  return await createContractEWallet(name, memberContract, signer)
}

export const createDomainChainlinkContract = async (
  linkAddress: string,
  oracle: string,
  jobId: string,
  signer: ethers.Signer
) => {
  return await createContractEWalletDomainChainlink(
    linkAddress,
    oracle,
    jobId.replace(/-/g, ''),
    signer
  )
}
