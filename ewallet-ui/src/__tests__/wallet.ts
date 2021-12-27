import * as ethers from 'ethers'
import { networkName, getWalletList } from './testConfig'

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

import { ETHEntity } from '../class/ETHEntity'
import { EntityRegistry } from '../class/EntityRegistry'


const testWallet = () => {

  let walletList: ethers.Signer[]
  let entityRegistry: EntityRegistry
  let entity: ETHEntity
  let memberId: number

  jest.setTimeout(600000)

  beforeAll(done => {
    const func_async = (async () => {

      try {
        //console.log("balance", await provider.getBalance("0x627306090abaB3A6e1400e9345bC60c78a8BEf57"))

        walletList = getWalletList()
        entityRegistry = new EntityRegistry({
          signer: walletList[0],
          networkName,
        });
        await entityRegistry.init()
        entity = new ETHEntity({
          name: "test",
          networkName,
          signer: walletList[0],
          memberName: "jr",
          deviceName: "PC",
          entityRegistry: entityRegistry,
        })
        await entity.init()
        memberId = await entity.getMemberIdFromAddress(await walletList[0].getAddress())
        done()
      } catch (error) {
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
      await entity.addMember(await walletList[2].getAddress(), "jr2", "PC2")
      await expect(entity.addMember(await walletList[2].getAddress(), "jr2", "PC2")).rejects.toThrow()
    })
    it('Entity found', async () => {
      expect(entity.contractAddress).toBeTruthy()
      await entity.depositFund(memberId, "0.01", "eth")
      await entity.update()
      await entity.withdrawFund(memberId, "0.01", "eth")
    })
    it('Entity allowance', async () => {
      expect(entity.contractAddress).toBeTruthy()
      await entity.setAllowance(memberId, "0.01", "eth")
      await entity.setAllowance(memberId, "0", "eth")
      await entity.setAllowance(await entity.getMemberIdFromAddress(await walletList[0].getAddress()), "0.01", "eth")
      await entity.setAllowance(await entity.getMemberIdFromAddress(await walletList[0].getAddress()), "0", "eth")
    })
  })

}

testWallet()
