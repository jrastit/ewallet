import * as ethers from 'ethers'
const networkName = "ganache"


import { network as networkList } from '../config/network.json'
import { NetworkType } from '../type/networkType'

const network: NetworkType = networkList.filter((network) => network.name === networkName)[0]

let privateKeys = require("../../key/" + networkName + "PrivateKeys.json")
const url = network.url
const provider = new ethers.providers.JsonRpcProvider(url)

const getWalletList = () => {
  return privateKeys.map((pk: string): ethers.Signer => {
    return new ethers.Wallet(pk, provider)
  })
}



export { network, networkName, provider, privateKeys, getWalletList }
