import * as ethers from 'ethers'
import { getWalletList, constant } from './testConfig'

import { DeployENSRegistry, hash as ENSHash } from '../util/ENS'

import {
  createContractEWalletENS
} from '../contract/solidity/compiled/contractAutoFactory'

const testENS = () => {

  let walletList: ethers.Signer[]

  jest.setTimeout(600000)

  beforeAll(done => {
    const func_async = (async () => {
      try {
        walletList = getWalletList()
        done()
      } catch (error) {
        done(error)
      }
    })
    func_async()
  })

  describe('ENS', () => {

    it('ENS', async () => {
      try {
        const ens = await DeployENSRegistry(walletList[0])
        //await ens.name('pam.resolver').setAddress('ETH', constant.kovanDaiAddress)
        const resolver = await ens.name('resolver').getAddress('ETH')
        await ens.name('').createSubdomain('eth')
        await ens.name('eth').setResolver(resolver)
        await ens.name('eth').createSubdomain('data')
        await ens.name('data.eth').setResolver(resolver)
        await ens.name('data.eth').createSubdomain('eth-usd')
        await ens.name('eth-usd.data.eth').setResolver(resolver)
        await ens.name('eth-usd.data.eth').setAddress('ETH', constant.kovanDaiAddress)
        const address = await ens.name('eth-usd.data.eth').getAddress('ETH')
        expect(address).toBe(constant.kovanDaiAddress)
        const contract = await createContractEWalletENS({ address: ethers.constants.AddressZero }, ens.ens.address, walletList[0])
        const address2 = await contract.resolveENS(ENSHash('eth-usd.data.eth'))
        expect(address2).toBe(constant.kovanDaiAddress)
        //expect(await contract.getENSChainlinkUSD('ETH')).toBe(constant.kovanDaiAddress)
        //const tx3 = await contract.addERC20Token("0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa", 'TEST', 'test')
        //console.log("tx2")
      } catch (e: any) {
        console.error(e)
        console.log(JSON.parse(e.error.body).error.message)
        expect(0).toBeTruthy()
      }
    })
  })
}

testENS()
