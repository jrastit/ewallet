import * as ethers from 'ethers'
import { provider, getWalletList } from './testConfig'

jest.setTimeout(50000)

const testNetwork = () => {
  it("network connect", async () => {

    const walletList = getWalletList()
    console.log("balance", ethers.utils.formatEther(await provider.getBalance(walletList[0].address)))
  })
}

testNetwork()
