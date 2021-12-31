import * as ethers from 'ethers'
import {
  WalletType,
  walletListFromJson,
  walletListToJson,
  walletNiceName,
  WalletConfigType,
  walletConfigFromJson,
  walletConfigToJson,
} from '../type/walletType'

const walletConfigLoad = (): WalletConfigType => {
  let walletConfig
  try {
    walletConfig = walletConfigFromJson(localStorage.getItem("walletConfig"))
    if (!walletConfig) {
      return {}
    }
  } catch (error) {
    console.error(error)
    return {}
  }
  return walletConfig
}

const walletConfigUpdatePassword = (password: string | undefined, passwordCheck: string) => {
  let walletConfig = walletConfigLoad()
  walletConfig.passwordCheck = passwordCheck
  walletConfig.password = password
  walletConfigSave(walletConfig)
  return walletConfig
}

const walletConfigSave = async (walletConfig: WalletConfigType) => {
  let walletConfigStr
  try {
    walletConfigStr = walletConfigToJson(walletConfig)
    if (walletConfigStr) {
      localStorage.setItem("walletConfig", walletConfigStr)
    } else {
      console.error("Wallet config is empty")
    }
  } catch (error) {
    console.error(error)
  }
}

const walletListLoad = async (password: string) => {
  let walletList
  try {
    walletList = walletListFromJson(localStorage.getItem("walletList"), password)
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

const walletListLoadAddress = async (address: string, password: string) => {
  const walletList = await walletListLoad(password)
  if (walletList) {
    const walletAddress = walletList.filter(wallet => wallet.address === address)
    if (walletAddress) return walletAddress[0]
  }
}

const walletListSave = async (walletList: WalletType[], password: string) => {
  let walletListStr
  try {
    walletListStr = walletListToJson(walletList, password)
    if (walletListStr) {
      localStorage.setItem("walletList", walletListStr)
    } else {
      console.error("Wallet list is empty")
    }
  } catch (error) {
    console.error(error)
  }
}

const walletAdd = async (name: string, pkey: string, password: string) => {
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
  let walletList = await walletListLoad(password)
  if (!walletList) {
    walletList = []
  }
  if (walletList.filter((_wallet) => wallet.address === _wallet.address).length > 0) {
    throw new Error("Wallet address already present")
  }
  walletList.push(wallet)
  walletListSave(walletList, password)
  return wallet
}

const walletDelete = async (address: string, password: string) => {
  let walletList = await walletListLoad(password)
  if (walletList) {
    walletList = walletList.filter(wallet => wallet.address !== address)
    walletListSave(walletList, password)
  }
}

const walletListDelete = () => {
  localStorage.removeItem("walletList")
  localStorage.removeItem("walletConfig")
}

export {
  walletListLoad,
  walletListSave,
  walletDelete,
  walletListDelete,
  walletConfigLoad,
  walletConfigSave,
  walletAdd,
  walletListLoadAddress,
  walletConfigUpdatePassword
}
