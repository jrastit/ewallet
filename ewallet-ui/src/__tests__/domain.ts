import * as ethers from 'ethers'

jest.mock('../contract/contractResource', () => {
  return {
    getAbi: function(abiPath: string) {
      var fs = require('fs')
      const path = require('path')
      return fs.readFileSync(path.resolve("src/contract/solidity/bin/" + abiPath)).toString()
    },

    getBin: function(binPath: string) {
      var fs = require('fs')
      const path = require('path')
      return fs.readFileSync(path.resolve("src/contract/solidity/bin/" + binPath)).toString()
    },
  };
});

jest.setTimeout(500000)

import { network as networkList } from '../config/network.json'

const networkName = "rinkeby2"

let walletList: ethers.Signer[]

import {
  createDomainContract,
  getERC20Contract
} from '../contract/contractFactory'

const testDomain = () => {

  let network: {
    name: string
    url: string
    chainId: number
    blockExplorerTxPrefix?: string
    faucet?: string
    entityRegistryAddress?: string
    contractDomain?: {
      linkAddress: string,
      oracle: string,
      jobId: string,
    }
  }
  let domainContract: ethers.Contract
  let linkContract: ethers.Contract
  let privateKeys = require("../../key/" + networkName + "PrivateKeys.json")
  let provider: ethers.providers.JsonRpcProvider

  beforeAll(done => {
    const func_async = (async () => {
      network = networkList.filter((network) => network.name === networkName)[0]
      const url = network.url
      provider = new ethers.providers.JsonRpcProvider(url)
      walletList = privateKeys.map((pk: string): ethers.Signer => {
        return new ethers.Wallet(pk, provider)
      })
      console.log("Wallet address", await walletList[0].getAddress())
      done()
    })
    func_async()
  })

  describe('Domain contract', () => {

    it("domain contract", async () => {
      expect(network.contractDomain).not.toBeUndefined()
      if (network.contractDomain) {
        linkContract = await getERC20Contract(
          network.contractDomain.linkAddress,
          walletList[0]
        )
        domainContract = await createDomainContract(
          walletList[0],
          network.contractDomain.linkAddress,
          network.contractDomain.oracle,
          network.contractDomain.jobId,
        )
        expect(domainContract.address).not.toBeUndefined()
        console.log("Domain Contract", domainContract.address)
        expect(linkContract.address).not.toBeUndefined()
        let balanceLink = await linkContract.balanceOf(domainContract.address)
        const walletBalanceLink = await linkContract.balanceOf(await walletList[0].getAddress())
        const fee = ethers.utils.parseUnits('0.01', 18)
        console.log("domain contract balance link", ethers.utils.formatUnits(balanceLink, 18))
        console.log("wallet balance link", ethers.utils.formatUnits(walletBalanceLink, 18))
        if (balanceLink.lt(fee)) {
          expect(walletBalanceLink.gte(fee.sub(balanceLink))).toBeTruthy()
          const tx = await linkContract.transfer(domainContract.address, fee.sub(balanceLink))
          const result = await tx.wait()
          //console.log(result)
          balanceLink = await linkContract.balanceOf(domainContract.address)
          console.log("domain contract balance link", ethers.utils.formatUnits(balanceLink, 18))
          console.log("wallet balance link", ethers.utils.formatUnits(walletBalanceLink, 18))
        }

        const domainList = await domainContract.getDomainList()
        console.log("domainList", domainList)

        const tx = await domainContract.requestDomainContract("katfy.com")
        const result = await tx.wait()
        //console.log(result)
        //const katfyaddress = await domainContract.getDomainAddress("katfy.com")
        //console.log("katfyaddress", katfyaddress)


      }
    })

  })
}

testDomain()
