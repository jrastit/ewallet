import * as ethers from 'ethers'
import { getWalletList, constant } from './testConfig'

import { createEWalletERC20InfoContract } from '../contract/contractFactory'

const testERC20Info = () => {

  let walletList: ethers.Signer[]

  jest.setTimeout(600000)

  beforeAll(done => {
    const func_async = (async () => {

      try {
        //console.log("balance", await provider.getBalance("0x627306090abaB3A6e1400e9345bC60c78a8BEf57"))

        walletList = getWalletList()
        done()
      } catch (error) {
        done(error)
      }
    })

    func_async()
  })

  describe('ERC20Info', () => {

    it('ERC20Info contract 0x ens', async () => {
      try {
        const contract = await createEWalletERC20InfoContract(walletList[0], ethers.constants.AddressZero)
        await (await contract.addERC20Token(ethers.constants.AddressZero, 'ETH', 'ether')).wait()
        expect((await contract.getERC20TokenListLength()).toNumber()).toBe(0)
        await (await contract.addERC20Token(constant.kovanDaiAddress, 'TEST', 'test')).wait()
        expect((await contract.getERC20TokenListLength()).toNumber()).toBe(1)
        try {
          expect(await contract.addERC20Token(constant.kovanDaiAddress, 'TEST', 'test')).toThrow()
        } catch (e: any) {
          console.log(JSON.parse(e.error.body).error.message)
        }
        await (await contract.addERC20Token(constant.addressOne, 'TEST2', 'test2')).wait()
        expect((await contract.getERC20TokenListLength()).toNumber()).toBe(2)
        await (await contract.removeERC20Token(constant.kovanDaiAddress)).wait()
        expect((await contract.getERC20TokenListLength()).toNumber()).toBe(1)



        //const tx3 = await contract.addERC20Token("0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa", 'TEST', 'test')
        //console.log("tx2")
      } catch (e) {
        console.error(e)
        expect(0).toBeTruthy()
      }
    })
  })
}

testERC20Info()
