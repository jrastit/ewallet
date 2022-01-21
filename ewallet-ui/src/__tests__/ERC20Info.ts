import * as ethers from 'ethers'
import { getTransactionManegerList, constant } from '../__test_util__/testConfig'

import { DeployENSRegistry, hash as ENSHash } from '../util/ENS'

import { EthersEntity } from '../class/ethers/EthersEntity'

import { TransactionManager } from '../util/TransactionManager'

import {
  createWithManagerContractEWalletENS,
  createWithManagerContractEWalletERC20Info,
  createWithManagerContractERC677,
} from '../contract/solidity/compiled/contractAutoFactory'

const testERC20Info = () => {

  let transactionManagerList: TransactionManager[]

  jest.setTimeout(600000)

  beforeAll(done => {
    const func_async = (async () => {

      try {
        //console.log("balance", await provider.getBalance("0x627306090abaB3A6e1400e9345bC60c78a8BEf57"))

        transactionManagerList = getTransactionManegerList()
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
        const ens = await DeployENSRegistry(transactionManagerList[0].signer)
        const resolver = await ens.name('resolver').getAddress('ETH')
        await ens.name('').createSubdomain('eth')
        await ens.name('eth').setResolver(resolver)
        await ens.name('eth').createSubdomain('data')
        await ens.name('data.eth').setResolver(resolver)
        await ens.name('data.eth').createSubdomain('eth-usd')
        await ens.name('eth-usd.data.eth').setResolver(resolver)
        await ens.name('eth-usd.data.eth').setAddress('ETH', constant.addressOne)

        const token1 = await createWithManagerContractERC677(
          await transactionManagerList[0].getAddress(),
          ethers.BigNumber.from(1000000),
          constant.tokenName,
          constant.tokenSymbol,
          transactionManagerList[0],
        )
        expect(await token1.symbol()).toBe(constant.tokenSymbol)
        expect(await token1.name()).toBe(constant.tokenName)
        expect(await token1.decimals()).toBe(18)

        const token2 = await createWithManagerContractERC677(
          await transactionManagerList[0].getAddress(),
          ethers.BigNumber.from(1000000),
          constant.token2Name,
          constant.token2Symbol,
          transactionManagerList[0],
        )

        const entity = new EthersEntity(undefined, undefined, {
          transactionManager: transactionManagerList[0]
        })
        await entity.newContract(
          "myEntity",
          "jr",
          "pc"
        )

        await entity.init()
        await entity.setRole(
          await entity.getMemberIdFromAddress(
            await transactionManagerList[0].getAddress()
          ),
          true
        )
        const ensContract = await createWithManagerContractEWalletENS(
          entity.getContract(),
          ens.ens.address,
          transactionManagerList[0],
        )
        await entity.addModuleRaw(ensContract.address)
        const memberId = entity.getMemberIdFromAddress(
          await transactionManagerList[0].getAddress()
        )
        const contract = await createWithManagerContractEWalletERC20Info(
          entity.getContract(),
          transactionManagerList[0])
        await transactionManagerList[0].sendTx(
          await contract.populateTransaction.setRole(
            memberId,
            true
          ), "Set role"
        )
        await transactionManagerList[0].sendTx(
          await contract.populateTransaction.addERC20Token(
            ethers.constants.AddressZero,
            'ETH',
            'ether',
            18
          ), "Add erc20 token 1"
        )
        expect((await contract.getERC20TokenListLength()).toNumber()).toBe(0)
        await transactionManagerList[0].sendTx(
          await contract.populateTransaction.addERC20Token(
            token1.address,
            constant.tokenSymbol,
            constant.tokenName,
            constant.tokenDecimals
          ), "Add erc20 token 2"
        )
        expect((await contract.getERC20TokenListLength()).toNumber()).toBe(1)
        try {
          expect(await contract.addERC20Token(
            token1.address,
            constant.tokenSymbol,
            constant.tokenName,
            constant.tokenDecimals
          )).toThrow()
        } catch (e: any) {
          console.log(JSON.parse(e.error.body).error.message)
        }
        await transactionManagerList[0].sendTx(
          await contract.populateTransaction.addERC20Token(
            token2.address,
            constant.token2Symbol,
            constant.token2Name,
            constant.token2Decimals
          ), "add erc20 token 3"
        )
        expect((await contract.getERC20TokenListLength()).toNumber()).toBe(2)
        expect((await contract.getERC20TokenList())[0].token).toBe(token1.address)
        expect((await contract.getERC20TokenList())[1].token).toBe(token2.address)
        await transactionManagerList[0].sendTx(
          await contract.populateTransaction.removeERC20Token(token2.address),
          "remove erc20 token"
        )
        expect((await contract.getERC20TokenListLength()).toNumber()).toBe(1)
        expect((await contract.getERC20TokenList())[0].token).toBe(token1.address)
        expect((await contract.getTokenInfo(token1.address)).token).toBe(token1.address)
        try {
          expect((await contract.getTokenInfo(token2.address)).token).toThrow()
        } catch (e: any) {
          console.log(JSON.parse(e.error.body).error.message)
        }
        await transactionManagerList[0].sendTx(
          await contract.populateTransaction.addERC20TokenWithMeta(token2.address),
          "add erc20 token with meta"
        )
        await transactionManagerList[0].sendTx(
          await contract.populateTransaction.setChainlinkUSDNode(
            token1.address,
            ENSHash("eth-usd.data.eth")
          ),
          "set chainlink usd node"
        )
        await transactionManagerList[0].sendTx(
          await contract.populateTransaction.updateChainlinkUSD(token1.address),
          "update chainlink usd"
        )

        const info = (await contract.getERC20TokenList())[0]
        expect(info.token).toBe(token1.address)
        expect(info.symbol).toBe(constant.tokenSymbol)
        expect(info.name).toBe(constant.tokenName)
        expect(info.decimals).toBe(constant.tokenDecimals)
        expect(info.chainlinkUSDNode).toBe(ENSHash("eth-usd.data.eth"))
        expect(info.chainlinkUSD).toBe(constant.addressOne)
        //const tx3 = await contract.addERC20Token("0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa", 'TEST', 'test')
        //console.log("tx2")
      } catch (e: any) {
        console.log(e)
        console.log(transactionManagerList[0].transactionList.map(transactionManagerList[0].log))
        expect(0).toBeTruthy()
      }
    })
  })
}

testERC20Info()
