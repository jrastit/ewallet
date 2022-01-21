import { LocalEntity } from '../class/local/LocalEntity'
import { LocalMember } from '../class/local/LocalMember'
import { LocalWallet } from '../class/local/LocalWallet'
import { LocalERC20Info } from '../class/local/LocalERC20Info'

import { EthersEntity } from '../class/ethers/EthersEntity'
import { EthersWallet } from '../class/ethers/EthersWallet'
import { EthersERC20Info } from '../class/ethers/EthersERC20Info'
import { getTransactionManegerList, networkName } from '../__test_util__/testConfig'
import { TransactionManager } from '../util/TransactionManager'



const testEntity = () => {
  describe('Local Entity', () => {

    it('Local Entity', async () => {
      const localEntity = new LocalEntity(
        undefined,
        {
          name: "localEntity"
        }
      )
      expect(localEntity.name).toBe("localEntity")
      const localMember = new LocalMember(localEntity)
      const localWallet = new LocalWallet(localEntity)
      const localERC20Info = new LocalERC20Info(localEntity)
      localEntity.addModule(localMember)
      localEntity.addModule(localWallet)
      localEntity.addModule(localERC20Info)
    })
  })

  describe('Ethers entity', () => {
    let transactionManagerList: TransactionManager[]
    beforeAll(done => {
      const func_async = (async () => {
        try {
          transactionManagerList = getTransactionManegerList()
          done()
        } catch (error) {
          done(error)
        }
      })
      func_async()
    })

    it('Ethers Entity', async () => {
      const entity = new EthersEntity(undefined, undefined, {
        networkName,
        transactionManager: transactionManagerList[0]
      })
      await entity.newContract("ethersEntity", "tester", "pctest")
      await entity.init()
      await entity.setRole(await entity.getMemberIdFromAddress(await transactionManagerList[0].getAddress()), true)

      const wallet = new EthersWallet(entity, undefined, {
        transactionManager: transactionManagerList[0]
      })
      await wallet.newContract()
      await wallet.init()

      await entity.addModule(wallet)

      const eRC20Info = new EthersERC20Info(entity, undefined, {
        transactionManager: transactionManagerList[0]
      })
      await eRC20Info.newContract()
      await entity.addModule(eRC20Info)

      expect(entity.name).toBe("ethersEntity")
    })

  })
}

testEntity()
