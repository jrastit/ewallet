import * as ethers from 'ethers'
import axios from 'axios'
import { network, getWalletList } from './testConfig'


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

let walletList: ethers.Signer[]

import {
  createDomainChainlinkContract,
} from '../contract/contractFactory'

import {
  createContractEWalletDomain,
  getContractIERC677,
} from '../contract/solidity/compiled/contractAutoFactory'

const requestAndFullfilDomain = async (domainName: string, domainContract: ethers.Contract) => {
  const tx = await domainContract.requestDomainContract(domainName)
  const result = await tx.wait()
  if (!network.contractDomainChainlink) {
    const requestId = result.events[0].args.requestId
    const domainName = result.events[0].args.domainName
    await fullfilDomain(domainName, requestId, domainContract)
  }
}

const fullfilDomain = async (domainName: string, requestId: string, domainContract: ethers.Contract) => {
  const response = await axios.post(
    "https://nft4.domains/api/dns/owner",
    { domain: domainName }
  )
  const data = response.data;
  let domainOwner = data.domain.txt.nft4domains.owner
  if (!domainOwner) {
    domainOwner = ethers.constants.AddressZero
  }
  const tx = await domainContract.fulfill(requestId, domainOwner)
  await tx.wait()
}

const testDomain = () => {

  let domainContract: ethers.Contract
  let linkContract: ethers.Contract

  beforeAll(done => {
    const func_async = (async () => {
      try {
        walletList = getWalletList()
        //console.log("Wallet address", await walletList[0].getAddress())
        done()
      } catch (error) {
        console.log(error)
        done(error)
      }

    })
    func_async()
  })

  describe('Domain contract', () => {

    it("domain contract", async () => {
      if (network.contractDomainChainlink) {
        linkContract = getContractIERC677(
          network.contractDomainChainlink.linkAddress,
          walletList[0]
        )
        domainContract = await createDomainChainlinkContract(
          await linkContract.getAddress(),
          network.contractDomainChainlink.oracle,
          network.contractDomainChainlink.jobId,
          walletList[0],
        )
      } else {
        domainContract = await createContractEWalletDomain(
          await walletList[0].getAddress(),
          walletList[0],
        )
      }
      expect(domainContract.address).not.toBeUndefined()
      //console.log("Domain Contract", domainContract.address)

      if (network.contractDomainChainlink) {
        expect(linkContract.address).not.toBeUndefined()
        let balanceLink = await linkContract.balanceOf(domainContract.address)
        const walletBalanceLink = await linkContract.balanceOf(await walletList[0].getAddress())
        const fee = ethers.utils.parseUnits('0.01', 18)
        console.log("domain contract balance link", ethers.utils.formatUnits(balanceLink, 18))
        console.log("wallet balance link", ethers.utils.formatUnits(walletBalanceLink, 18))
        if (balanceLink.lt(fee)) {
          expect(walletBalanceLink.gte(fee.sub(balanceLink))).toBeTruthy()
          const tx = await linkContract.transfer(domainContract.address, fee.sub(balanceLink))
          await tx.wait()
          balanceLink = await linkContract.balanceOf(domainContract.address)
          console.log("domain contract balance link", ethers.utils.formatUnits(balanceLink, 18))
          console.log("wallet balance link", ethers.utils.formatUnits(walletBalanceLink, 18))
        }
      }

      const domainList = await domainContract.getDomainList()
      expect(domainList[1]).toBeUndefined()

      await requestAndFullfilDomain("katfy.com", domainContract);
      await requestAndFullfilDomain("test.com", domainContract);

      const katfyaddress = await domainContract.getDomainOwner("katfy.com")
      expect(katfyaddress).toEqual("0x703358A13db810B49Ce6DF2ccdc3e9DfF3845b86")

      const testaddress = await domainContract.getDomainOwner("test.com")
      expect(testaddress).toEqual("0x0000000000000000000000000000000000000000")

      const domainList2 = await domainContract.getDomainList()
      expect(domainList2[1].ownerAddress).toEqual("0x703358A13db810B49Ce6DF2ccdc3e9DfF3845b86")
      expect(domainList2[1].domainName).toEqual("katfy.com")
      expect(domainList2[2].ownerAddress).toEqual("0x0000000000000000000000000000000000000000")
      expect(domainList2[2].domainName).toEqual("test.com")


    })

  })
}

testDomain()
