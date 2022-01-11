import { ethers } from 'ethers'
import { hash } from 'eth-ens-namehash'
import ENS from '@ensdomains/ensjs'

import {
  createContractENSRegistry,
  createContractPublicResolver,
} from '../contract/solidity/compiled/contractAutoFactory'

const labelhash = (label: string) => ethers.utils.keccak256(ethers.utils.toUtf8Bytes(label))

async function setupResolver(ens: ethers.Contract, resolver: ethers.Contract, ownerAddress: string) {
  const resolverNode = hash("resolver")
  const resolverLabel = labelhash("resolver")

  await ens.setSubnodeOwner(ethers.constants.HashZero, resolverLabel, ownerAddress)
  await ens.setResolver(resolverNode, resolver.address)
  await resolver["setAddr(bytes32,address)"](resolverNode, resolver.address)
}

async function DeployENSRegistry(signer: ethers.Signer) {
  const registry = await createContractENSRegistry(signer)
  const resolver = await createContractPublicResolver(registry.address, ethers.constants.AddressZero, signer)
  await setupResolver(registry, resolver, await signer.getAddress())
  return new ENS({ provider: signer.provider, ensAddress: registry.address })
}

export {
  DeployENSRegistry,
  hash,
}
