import { ethers } from 'ethers'


import jsonEWalletRegistry from './solidity/compiled/EWalletRegistry.json'
import jsonEWallet from './solidity/compiled/EWallet.json'
import jsonEWalletMember from './solidity/compiled/EWalletMember.json'
import jsonIEWalletDomain from './solidity/compiled/IEWalletDomain.json'
import jsonEWalletDomain from './solidity/compiled/EWalletDomain.json'
import jsonEWalletDomainChainlink from './solidity/compiled/EWalletDomainChainlink.json'
import jsonEWalletToken from './solidity/compiled/EWalletToken.json'
import jsonEWalletERC20Info from './solidity/compiled/EWalletERC20Info.json'
import jsonEWalletMemberFactory from './solidity/compiled/EWalletMemberFactory.json'
import jsonEWalletFactory from './solidity/compiled/EWalletFactory.json'
import jsonIERC677 from './solidity/compiled/IERC677.json'
import jsonERC677 from './solidity/compiled/ERC677.json'
import jsonENS from './solidity/compiled/ENS/ENS.json'
import jsonENSRegistry from './solidity/compiled/ENS/ENSRegistry.json'
import jsonENSResolver from './solidity/compiled/ENS/Resolver.json'
import jsonENSPublicResolver from './solidity/compiled/ENS/PublicResolver.json'

const getAbiRegistry = () => {
  return jsonEWalletRegistry.abi
}

const getAbiWallet = () => {
  return jsonEWallet.abi
}

const getAbiMember = () => {
  return jsonEWalletMember.abi
}

const getAbiIDomain = () => {
  return jsonIEWalletDomain.abi
}

const getAbiDomain = () => {
  return jsonEWalletDomain.abi
}

const getAbiDomainChainlink = () => {
  return jsonEWalletDomainChainlink.abi
}

const getAbiEWalletToken = () => {
  return jsonEWalletToken.abi
}

const getAbiEWalletERC20Info = () => {
  return jsonEWalletERC20Info.abi
}

const getAbiMemberFactory = () => {
  return jsonEWalletMemberFactory.abi
}

const getAbiEWalletFactory = () => {
  return jsonEWalletFactory.abi
}

const getAbiERC677 = () => {
  return jsonERC677.abi
}

const getAbiIERC677 = () => {
  return jsonIERC677.abi
}

const getAbiENS = () => {
  return jsonENS.abi
}

const getAbiENSRegistry = () => {
  return jsonENSRegistry.abi
}

const getAbiENSResolver = () => {
  return jsonENSResolver.abi
}

const getAbiENSPublicResolver = () => {
  return jsonENSPublicResolver.abi
}

const createMemberFactoryContract = async (signer: ethers.Signer) => {
  const factory = new ethers.ContractFactory(
    getAbiMemberFactory(),
    jsonEWalletMemberFactory.bytecode,
    signer)
  const contract = await factory.deploy()
  await contract.deployed()
  return contract
}

const createEWalletFactoryContract = async (signer: ethers.Signer) => {
  const memberFactoryContract = await createMemberFactoryContract(signer)
  const factory = new ethers.ContractFactory(
    getAbiEWalletFactory(),
    jsonEWalletFactory.bytecode,
    signer)
  const contract = await factory.deploy(memberFactoryContract.address)
  await contract.deployed()
  return contract
}

const createRegistryContract = async (signer: ethers.Signer) => {
  const eWalletFactoryContract = await createEWalletFactoryContract(signer)
  const factory = new ethers.ContractFactory(
    getAbiRegistry(),
    jsonEWalletRegistry.bytecode,
    signer)
  const contract = await factory.deploy(eWalletFactoryContract.address)
  await contract.deployed()
  return contract
}

const createMemberContract = async (memberName: string, deviceName: string, signer: ethers.Signer) => {
  const factory = new ethers.ContractFactory(
    getAbiMember(),
    jsonEWalletMember.bytecode,
    signer)
  const contract = await factory.deploy(memberName, deviceName)
  await contract.deployed()
  return contract
}

const createWalletContract = async (name: string, memberName: string, deviceName: string, signer: ethers.Signer) => {
  const memberContract = await createMemberContract(memberName, deviceName, signer)
  const factory = new ethers.ContractFactory(
    getAbiWallet(),
    jsonEWallet.bytecode,
    signer)
  const contract = await factory.deploy(name, memberContract.address)
  await contract.deployed()
  return contract
}

const createDomainContract = async (signer: ethers.Signer, oracle: string) => {
  const factory = new ethers.ContractFactory(
    getAbiDomain(),
    jsonEWalletDomain.bytecode,
    signer)
  const contract = await factory.deploy(
    oracle,
  )
  await contract.deployed()
  return contract
}

const createDomainChainlinkContract = async (signer: ethers.Signer, linkAddress: string, oracle: string, jobId: string) => {
  const factory = new ethers.ContractFactory(
    getAbiDomainChainlink(),
    jsonEWalletDomainChainlink.bytecode,
    signer)
  const contract = await factory.deploy(
    linkAddress,
    oracle,
    jobId.replace(/-/g, ''),
  )
  await contract.deployed()
  return contract
}

const createEWalletTokenContract = async (signer: ethers.Signer, name: string, symbol: string, initialSupply: ethers.BigNumber, defaultOperators: string[]) => {
  const factory = new ethers.ContractFactory(
    getAbiEWalletToken(),
    jsonEWalletToken.bytecode,
    signer)
  const contract = await factory.deploy(
    name,
    symbol,
    initialSupply,
    defaultOperators,
  )
  await contract.deployed()
  return contract
}

const createEWalletERC20InfoContract = async (signer: ethers.Signer, ensAddress: string) => {
  const factory = new ethers.ContractFactory(
    getAbiEWalletERC20Info(),
    jsonEWalletERC20Info.bytecode,
    signer)
  const contract = await factory.deploy(
    ensAddress,
  )
  await contract.deployed()
  return contract
}

const createERC677Contract = async (
  signer: ethers.Signer,
  initialAccount: string,
  initialBalance: ethers.BigNumber,
  tokenName: string,
  tokenSymbol: string,
) => {
  const factory = new ethers.ContractFactory(
    getAbiERC677(),
    jsonERC677.bytecode,
    signer)
  const contract = await factory.deploy(
    initialAccount,
    initialBalance,
    tokenName,
    tokenSymbol,
  )
  await contract.deployed()
  return contract
}

const createENSRegistryContract = async (
  signer: ethers.Signer,
) => {
  const factory = new ethers.ContractFactory(
    getAbiENSRegistry(),
    jsonENSRegistry.bytecode,
    signer)
  const contract = await factory.deploy(
  )
  await contract.deployed()
  return contract
}

const createENSPublicResolverContract = async (
  signer: ethers.Signer,
  registryAddress: string,
) => {
  const factory = new ethers.ContractFactory(
    getAbiENSPublicResolver(),
    jsonENSPublicResolver.bytecode,
    signer)
  const contract = await factory.deploy(
    registryAddress,
    ethers.constants.AddressZero,
  )
  await contract.deployed()
  return contract
}

const getRegistryContract = async (contractAddress: string, signer: ethers.Signer) => {
  return new ethers.Contract(contractAddress, getAbiRegistry(), signer)
}

const getWalletContract = async (contractAddress: string, signer: ethers.Signer) => {
  return new ethers.Contract(contractAddress, getAbiWallet(), signer)
}

const getMemberContract = async (contract: ethers.Contract, signer: ethers.Signer) => {
  return new ethers.Contract(await contract.memberContract(), getAbiMember(), signer)
}

const getIDomainContract = async (contractAddress: string, signer: ethers.Signer) => {
  return new ethers.Contract(contractAddress, getAbiIDomain(), signer)
}

const getDomainContract = async (contractAddress: string, signer: ethers.Signer) => {
  return new ethers.Contract(contractAddress, getAbiDomain(), signer)
}

const getDomainChainlinkContract = async (contractAddress: string, signer: ethers.Signer) => {
  return new ethers.Contract(contractAddress, getAbiDomain(), signer)
}

const getEWalletTokenContract = async (contractAddress: string, signer: ethers.Signer) => {
  return new ethers.Contract(contractAddress, getAbiEWalletToken(), signer)
}

const getEWalletERC20InfoContract = async (contractAddress: string, signer: ethers.Signer) => {
  return new ethers.Contract(contractAddress, getAbiEWalletERC20Info(), signer)
}

const getIERC677Contract = async (contractAddress: string, signer: ethers.Signer) => {
  return new ethers.Contract(contractAddress, getAbiIERC677(), signer)
}

const getERC677Contract = async (contractAddress: string, signer: ethers.Signer) => {
  return new ethers.Contract(contractAddress, getAbiERC677(), signer)
}

const getENSContract = async (contractAddress: string, signer: ethers.Signer) => {
  return new ethers.Contract(contractAddress, getAbiENS(), signer)
}

const getENSRegistryContract = async (contractAddress: string, signer: ethers.Signer) => {
  return new ethers.Contract(contractAddress, getAbiENSRegistry(), signer)
}

const getENSResolverContract = async (contractAddress: string, signer: ethers.Signer) => {
  return new ethers.Contract(contractAddress, getAbiENSResolver(), signer)
}

const getENSPublicResolverContract = async (contractAddress: string, signer: ethers.Signer) => {
  return new ethers.Contract(contractAddress, getAbiENSPublicResolver(), signer)
}

export {
  createRegistryContract,
  createMemberContract,
  createWalletContract,
  createDomainContract,
  createDomainChainlinkContract,
  createEWalletTokenContract,
  createEWalletERC20InfoContract,
  createERC677Contract,
  createENSRegistryContract,
  createENSPublicResolverContract,
  getRegistryContract,
  getWalletContract,
  getMemberContract,
  getIDomainContract,
  getDomainContract,
  getDomainChainlinkContract,
  getEWalletTokenContract,
  getEWalletERC20InfoContract,
  getIERC677Contract,
  getERC677Contract,
  getENSContract,
  getENSRegistryContract,
  getENSResolverContract,
  getENSPublicResolverContract,

}
