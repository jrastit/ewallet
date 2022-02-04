import * as ethers from 'ethers'
import { networkName, getTransactionManegerList } from '../__test_util__/testConfig'

const fakeLocalStorage = (function() {
  let store: any = {};

  return {
    getItem: function(key: string) {
      return store[key] || null;
    },
    setItem: function(key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem: function(key: string) {
      delete store[key];
    },
    clear: function() {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: fakeLocalStorage,
});
import { TransactionManager } from '../util/TransactionManager'
import { EthersEntity } from '../contract/ethers/EthersEntity'
import { EthersMember } from '../module/member/contract/EthersMember'
import { EthersWallet } from '../module/wallet/contract/EthersWallet'
import { EthersEntityRegistry } from '../contract/ethers/EthersEntityRegistry'


const testWallet = () => {

  let transactionManagerList: TransactionManager[]
  let entityRegistry: EthersEntityRegistry
  let entity: EthersEntity
  let memberModule: EthersMember
  let walletModule: EthersWallet
  let memberId: number

  jest.setTimeout(600000)

  beforeAll(done => {
    const func_async = (async () => {

      try {
        //console.log("balance", await provider.getBalance("0x627306090abaB3A6e1400e9345bC60c78a8BEf57"))

        transactionManagerList = getTransactionManegerList()
        entityRegistry = new EthersEntityRegistry({
          transactionManager: transactionManagerList[0],
          networkName,
        });
        await entityRegistry.newContract("admin", "jr", "pc")
        await entityRegistry.init()
        entity = await entityRegistry.createEntity("test", "jr", "pc")
        memberId = await entity.getMemberIdFromAddress(await transactionManagerList[0].getAddress())
        memberModule = await entity.getModuleMember()

        await entity.setRole(memberId, { manageModule: true })
        await entity.addModuleWallet()
        await entity.addModuleERC20Info()
        await entity.addModuleENS()
        walletModule = await entity.getModuleWallet()
        const erc20Info = await entity.getModuleERC20Info()
        await erc20Info.setRole(memberId, { manageToken: true })
        await erc20Info.addERC20Token(
          ethers.constants.AddressZero,
          'ETH',
          'eth',
          18
        )
        done()
      } catch (error) {
        console.error(error)
        console.log(
          transactionManagerList[0].transactionList.map(
            transactionManagerList[0].log
          )
        )
        done(error)
      }
    })

    func_async()
  })

  describe('Enity Registry', () => {

    it('Entity registry contract address', async () => {
      expect(entityRegistry.contractAddress).toBeTruthy()
    })
    it('Entity contract', async () => {
      expect(entity.contractAddress).toBeTruthy()
      expect(memberId).toEqual(0)
    })
    it('Entity add member', async () => {
      expect(entity.contractAddress).toBeTruthy()
      await memberModule.addMember(await transactionManagerList[2].getAddress(), "jr2", "PC2")
      await expect(memberModule.addMember(await transactionManagerList[2].getAddress(), "jr2", "PC2")).rejects.toThrow()
    })
    it('Entity found', async () => {
      expect(walletModule.contractAddress).toBeTruthy()
      await walletModule.depositFund(memberId, "0.01", "eth")
      await walletModule.withdrawFund(memberId, "0.01", "eth")
    })
    it('Entity allowance', async () => {
      expect(walletModule.contractAddress).toBeTruthy()
      await walletModule.setRole(memberId, { allowanceManager: true })
      await walletModule.setAllowance(memberId, "0.01", "eth")
      await walletModule.setAllowance(memberId, "0", "eth")
      await walletModule.setAllowance(await entity.getMemberIdFromAddress(await transactionManagerList[0].getAddress()), "0.01", "eth")
      await walletModule.setAllowance(await entity.getMemberIdFromAddress(await transactionManagerList[0].getAddress()), "0", "eth")
    })
  })

}

testWallet()
