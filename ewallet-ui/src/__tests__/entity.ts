import { LocalEntity } from '../contract/local/LocalEntity'
import { LocalMember } from '../module/member/contract/LocalMember'
import { LocalWallet } from '../module/wallet/contract/LocalWallet'
import { LocalERC20Info } from '../module/erc20Info/contract/LocalERC20Info'

import { EthersEntity } from '../contract/ethers/EthersEntity'
import { EthersWallet } from '../module/wallet/contract/EthersWallet'
import { EthersERC20Info } from '../module/erc20Info/contract/EthersERC20Info'
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
      const memberId = await entity.getMemberIdFromAddress(await transactionManagerList[0].getAddress())
      const role0 = await entity.getRole(memberId)
      expect(role0).toStrictEqual({ manageModule: false })
      await entity.setRole(memberId, { manageModule: true })
      const role1 = await entity.getRole(memberId)
      expect(role1).toStrictEqual({ manageModule: true })

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
