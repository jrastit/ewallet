import * as ethers from 'ethers'

import { network as networkList } from '../config/network.json'

const networkName = "rinkeby2"

jest.setTimeout(50000)

const testNetwork = () => {
  it("network connect", async () => {
    const network = networkList.filter((network) => network.name === networkName)[0]
    const url = network.url
    const privateKeys = require("../../key/" + networkName + "PrivateKeys.json")
    const provider = new ethers.providers.JsonRpcProvider(url)
    const walletList = privateKeys.map((pk: string): ethers.Signer => {
      return new ethers.Wallet(pk, provider)
    })
    console.log("balance", ethers.utils.formatEther(await provider.getBalance(walletList[0].address)))
  })
}

testNetwork()
