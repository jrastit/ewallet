import { LocalEntity } from '../class/local/LocalEntity'
import { LocalMember } from '../class/local/LocalMember'
import { LocalWallet } from '../class/local/LocalWallet'
import { LocalERC20Info } from '../class/local/LocalERC20Info'

import { EthersEntity } from '../class/ethers/EthersEntity'
import { EthersWallet } from '../class/ethers/EthersWallet'
import { EthersERC20Info } from '../class/ethers/EthersERC20Info'
import * as ethers from 'ethers'
import { getWalletList, networkName } from './testConfig'

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
    let walletList: ethers.Signer[]
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

    it('Ethers Entity', async () => {
      const entity = new EthersEntity(undefined, undefined, {
        networkName,
        signer: walletList[0]
      })
      await entity.newContract("ethersEntity", "tester", "pctest")
      await entity.init()
      await entity.setRole(await entity.getMemberIdFromAddress(await walletList[0].getAddress()), true)

      const wallet = new EthersWallet(entity, undefined, {
        signer: walletList[0]
      })
      await wallet.newContract()
      await wallet.init()

      await entity.addModule(wallet)

      const eRC20Info = new EthersERC20Info(entity, undefined, {
        signer: walletList[0]
      })
      await eRC20Info.newContract()
      await entity.addModule(eRC20Info)

      expect(entity.name).toBe("ethersEntity")
    })

  })
}

testEntity()
