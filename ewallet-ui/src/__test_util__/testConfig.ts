import * as ethers from 'ethers'
const networkName = "ganache"

import { TransactionManager } from '../util/TransactionManager'

import { network as networkList } from '../config/network.json'
import { NetworkType } from '../type/networkType'

const network: NetworkType = networkList.filter((network) => network.name === networkName)[0]

let privateKeys = require("../../key/" + networkName + "PrivateKeys.json")
const url = network.url
const provider = new ethers.providers.JsonRpcProvider(url)

const getWalletList = (): ethers.Signer[] => {
  return privateKeys.map((pk: string): ethers.Signer => {
    return new ethers.Wallet(pk, provider)
  })
}

const getTransactionManegerList = () => {
  return getWalletList().map((signer: ethers.Signer): TransactionManager => new TransactionManager(signer))
}

const constant = {
  kovanDaiAddress: "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa",
  addressOne: "0x0000000000000000000000000000000000000001",
  tokenName: "test",
  tokenSymbol: "TST",
  tokenDecimals: 9,
  token2Name: "test2",
  token2Symbol: "TST2",
  token2Decimals: 10,
}


export { network, networkName, provider, privateKeys, getWalletList, getTransactionManegerList, constant }
