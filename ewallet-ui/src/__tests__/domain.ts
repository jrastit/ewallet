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

jest.setTimeout(50000)

import { network as networkList } from '../config/network.json'

const networkName = "rinkeby2"

let walletList: ethers.Signer[]

import {
  createDomainContract
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

      done()
    })
    func_async()
  })

  describe('Domain contract', () => {

    it("domain contract", async () => {
      expect(network.contractDomain).not.toBeUndefined()
      if (network.contractDomain) {

        domainContract = await createDomainContract(
          walletList[0],
          network.contractDomain.linkAddress,
          network.contractDomain.oracle,
          network.contractDomain.jobId,
        )
        expect(domainContract.address).not.toBeUndefined()
        //console.log("domainContract", domainContract ?.address)
        //expect(domainContract.address).toBeTruthy()
        const domainList = await domainContract.getDomainList()
        console.log("domainList", domainList)
        const tx = await domainContract.requestDomainContract("katfy.com")
        const result = await tx.wait()
        console.log(result)
        const katfyaddress = await domainContract.getDomainAddress("katfy.com")
        console.log("katfyaddress", katfyaddress)


      }
    })

  })
}

testDomain()
