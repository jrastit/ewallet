import { ethers } from 'ethers'

import { TransactionManager } from '../util/TransactionManager'

import {
  createWithManagerContractEWalletMemberFactory,
  createWithManagerContractEWalletFactory,
  createWithManagerContractEWalletWalletFactory,
  createWithManagerContractEWalletERC20InfoFactory,
  createWithManagerContractEWalletENSFactory,
  createWithManagerContractEWalletRegistry,
  createWithManagerContractEWalletMember,
  createWithManagerContractEWallet,
  createWithManagerContractEWalletDomainChainlink,
  createWithManagerContractEWalletModuleAdmin,
  getContractEWallet,
  getContractEWalletModuleAdmin,
} from './solidity/compiled/contractAutoFactory'

export const createRegistryContract = async (
  name: string,
  ownerName: string,
  ownerDeviceName: string,
  ownerAddress: string,
  transactionManager: TransactionManager
) => {
  const eWalletFactoryContract = await createWithManagerContractEWalletFactory(
    transactionManager
  )
  const eWalletMemberFactoryContract = await createWithManagerContractEWalletMemberFactory(
    transactionManager
  )
  const eWalletContract = getContractEWallet(
    ethers.constants.AddressZero,
    transactionManager.signer
  )
  const eWalletModuleAdmin = await createWithManagerContractEWalletModuleAdmin(
    eWalletFactoryContract,
    eWalletMemberFactoryContract,
    name,
    ownerName,
    ownerDeviceName,
    ownerAddress,
    eWalletContract,
    transactionManager
  )
  const eWalletWalletFactoryContract = await createWithManagerContractEWalletWalletFactory(
    transactionManager
  )

  await transactionManager.sendTx(
    await eWalletModuleAdmin.populateTransaction.setEWalletWalletFactory(
      eWalletWalletFactoryContract.address
    ),
    'Set EWallet Wallet factory'
  )

  const eWalletERC20InfoFactoryContract = await createWithManagerContractEWalletERC20InfoFactory(
    transactionManager
  )

  await transactionManager.sendTx(
    await eWalletModuleAdmin.populateTransaction.setEWalletERC20InfoFactory(
      eWalletERC20InfoFactoryContract.address
    ),
    'Set EWallet ERC20Info factory'
  )

  const eWalletENSFactoryContract = await createWithManagerContractEWalletENSFactory(
    ethers.constants.AddressZero,
    transactionManager
  )

  await transactionManager.sendTx(
    await eWalletModuleAdmin.populateTransaction.setEWalletENSFactory(
      eWalletENSFactoryContract.address
    ),
    'Set EWallet ENS factory'
  )

  const eWalletRegistryContract = await createWithManagerContractEWalletRegistry(
    eWalletModuleAdmin,
    transactionManager
  )
  await transactionManager.sendTx(
    await eWalletModuleAdmin.populateTransaction.setEWalletRegistry(
      eWalletRegistryContract.address
    ),
    'Set EWallet Registry'
  )
  return eWalletRegistryContract
}

export const createWalletContract = async (
  name: string,
  memberName: string,
  deviceName: string,
  transactionManager: TransactionManager
) => {
  const memberContract = await createWithManagerContractEWalletMember(
    memberName,
    deviceName,
    await transactionManager.getAddress(),
    transactionManager
  )
  const moduleAdmin = getContractEWalletModuleAdmin(
    ethers.constants.AddressZero,
    transactionManager.signer
  )
  return await createWithManagerContractEWallet(
    name,
    memberContract,
    moduleAdmin,
    transactionManager
  )
}

export const createDomainChainlinkContract = async (
  linkAddress: string,
  oracle: string,
  jobId: string,
  transactionManager: TransactionManager
) => {
  return await createWithManagerContractEWalletDomainChainlink(
    linkAddress,
    oracle,
    jobId.replace(/-/g, ''),
    transactionManager
  )
}
