import * as ethers from 'ethers'
import {
  WalletType,
  walletListFromJson,
  walletListToJson,
  walletNiceName,
} from '../type/walletType'

const walletListLoad = async () => {
  let walletList
  try {
    walletList = walletListFromJson(localStorage.getItem("walletList"))
    if (walletList) {
      walletList.sort((a, b) => {
        const name = walletNiceName(a)
        const name2 = walletNiceName(b)
        return (name > name2) ? 1 : ((name > name2) ? -1 : 0)
      })
    }
  } catch (error) {
    console.error(error)
    return
  }
  return walletList
}

const walletListLoadAddress = async (address: string) => {
  const walletList = await walletListLoad()
  if (walletList) {
    const walletAddress = walletList.filter(wallet => wallet.address === address)
    if (walletAddress) return walletAddress[0]
  }
}

const walletListSave = async (walletList: WalletType[]) => {
  let walletListStr
  try {
    walletListStr = walletListToJson(walletList)
    if (walletListStr) {
      localStorage.setItem("walletList", walletListStr)
    } else {
      console.error("Wallet list is empty")
    }
  } catch (error) {
    console.error(error)
  }
}

const walletAdd = async (name: string, pkey: string) => {
  let ethersWallet: ethers.Wallet
  if (!pkey) {
    ethersWallet = ethers.Wallet.createRandom()
    pkey = ethersWallet.privateKey
  } else {
    ethersWallet = new ethers.Wallet(pkey)
  }
  const wallet: WalletType = {
    name,
    address: await ethersWallet.getAddress(),
    pkey,
  }
  let walletList = await walletListLoad()
  if (!walletList) {
    walletList = []
  }
  walletList.push(wallet)
  walletListSave(walletList)
  return wallet
}

const walletListDelete = () => {
  return localStorage.removeItem("walletList")
}

export {
  walletListLoad,
  walletListSave,
  walletListDelete,
  walletAdd,
  walletListLoadAddress
}
