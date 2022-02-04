import * as ethers from 'ethers'
import { provider, getWalletList } from '../__test_util__/testConfig'

jest.setTimeout(50000)

const testNetwork = () => {
  it("network connect", async () => {

    const walletList = getWalletList()
    const balance = ethers.utils.formatEther(await provider.getBalance(await walletList[0].getAddress()))
    expect(balance).toBeTruthy()
    //console.log("balance", ethers.utils.formatEther(await provider.getBalance(walletList[0].address)))
  })
}

testNetwork()
