import * as ethers from 'ethers'
import { getWalletList } from '../__test_util__/testConfig'

import {
  createWithManagerContractERC677,
} from '../contract/solidity/compiled/contractAutoFactory'

import { TransactionManager } from '../util/TransactionManager'

console.log("here")

const testTransaction = () => {

  let walletList: ethers.Signer[]

  jest.setTimeout(600000)

  let transactionManager: TransactionManager

  beforeAll(done => {
    const func_async = (async () => {

      try {
        walletList = getWalletList()
        transactionManager = new TransactionManager(walletList[0])
        done()
      } catch (error) {
        done(error)
      }
    })

    func_async()
  })

  describe('Test transaction token', () => {
    it('Test transaction token', async () => {
      const contract = await createWithManagerContractERC677(
        await walletList[0].getAddress(),
        ethers.utils.parseUnits("100"),
        "test",
        "TST",
        transactionManager
      )

      await transactionManager.sendTx(await contract.populateTransaction.transfer(
        await walletList[0].getAddress(),
        ethers.utils.parseUnits("0.001")
      ), "Transfer")
      console.log(transactionManager.transactionList.map(transactionManager.gasInfo))
      console.log(transactionManager.transactionList.map(transactionManager.log))
    })

  })
}

testTransaction()
