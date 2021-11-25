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
import { Entity } from '../class/Entity'
import { EntityRegistry } from '../class/EntityRegistry'

const networkName = "ganache"

const testWallet = () => {
  let privateKeys = [
    "c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3",
    "ae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f",
    "0dbbe8e4ae425a6d2687f1a7e3ba17bc98c673636790f1b8ad91193c05875ef1",
    "c88b703fb08cbea894b6aeff5a544fb92e78a18e19814cd85da83b71f772aa6c",
    "388c684f0ba1ef5017716adb5d21a053ea8e90277d0868337519f97bede61418",
  ]
  //const url = "http://127.0.0.1:8545"

  let walletList: ethers.Signer[]

  let entityRegistry: EntityRegistry

  let entity: ETHEntity

  let memberId: number

  const provider = new ethers.providers.JsonRpcProvider()


  beforeAll(done => {
    const func_async = (async () => {

      console.log("balance", await provider.getBalance("0x627306090abaB3A6e1400e9345bC60c78a8BEf57"))

      walletList = privateKeys.map((pk: string): ethers.Signer => {
        return new ethers.Wallet(pk, provider)
      })
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
