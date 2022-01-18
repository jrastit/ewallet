import { ethers } from 'ethers'

import {
  createContractEWalletMemberFactory,
  createContractEWalletFactory,
  createContractEWalletWalletFactory,
  createContractEWalletERC20InfoFactory,
  createContractEWalletENSFactory,
  createContractEWalletRegistry,
  createContractEWalletMember,
  createContractEWallet,
  createContractEWalletDomainChainlink,
  createContractEWalletModuleAdmin,
  getContractEWallet,
  getContractEWalletModuleAdmin,
} from './solidity/compiled/contractAutoFactory'

export const createRegistryContract = async (
  name: string,
  ownerName: string,
  ownerDeviceName: string,
  ownerAddress: string,
  signer: ethers.Signer
) => {
  console.log("Create ewallet factory")
  const eWalletFactoryContract = await createContractEWalletFactory(signer)
  console.log("Create ewallet member factory")
  const eWalletMemberFactoryContract = await createContractEWalletMemberFactory(signer)
  const eWalletContract = getContractEWallet(ethers.constants.AddressZero, signer)
  console.log("Create ewallet module admin")
  const eWalletModuleAdmin = await createContractEWalletModuleAdmin(
    eWalletFactoryContract,
    eWalletMemberFactoryContract,
    name,
    ownerName,
    ownerDeviceName,
    ownerAddress,
    eWalletContract,
    signer
  )
  console.log("create eWalletWalletFactory")
  const eWalletWalletFactoryContract = await createContractEWalletWalletFactory(signer)
  {
    console.log("register eWalletWalletFactory")
    const tx = await eWalletModuleAdmin.setEWalletWalletFactory(eWalletWalletFactoryContract.address)
    await tx.wait()
  }
  console.log("create eWalletERC20InfoFactory")
  const eWalletERC20InfoFactoryContract = await createContractEWalletERC20InfoFactory(signer)
  {
    console.log("register eWalletFactory")
    const tx = await eWalletModuleAdmin.setEWalletERC20InfoFactory(eWalletERC20InfoFactoryContract.address)
    await tx.wait()
  }
  console.log("create eWalletENSFactory")
  const eWalletENSFactoryContract = await createContractEWalletENSFactory(ethers.constants.AddressZero, signer)
  {
    console.log("register eWalletFactory")
    const tx = await eWalletModuleAdmin.setEWalletENSFactory(eWalletENSFactoryContract.address)
    await tx.wait()
  }

  console.log("Create ewallet registry")
  const eWalletRegistryContract = await createContractEWalletRegistry(eWalletModuleAdmin, signer)
  console.log("set registry in admin")
  const tx = await eWalletModuleAdmin.setEWalletRegistry(eWalletRegistryContract.address)
  await tx.wait()
  return eWalletRegistryContract
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
    await signer.getAddress(),
    signer
  )
  const moduleAdmin = getContractEWalletModuleAdmin(ethers.constants.AddressZero, signer)
  return await createContractEWallet(name, memberContract, moduleAdmin, signer)
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
