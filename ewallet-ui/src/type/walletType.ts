import encUTF8 from 'crypto-js/enc-utf8';
import AES from 'crypto-js/aes';

import { formatAddress } from '../util/formatData'

type WalletType = {
  name?: string
  address: string
  pkey?: string
}

type WalletConfigType = {
  walletType?: string
  walletAddress?: string
  networkName?: string
  password?: string
  passwordCheck?: string
}

const walletToString = (wallet: WalletType, password: string) => {
  return {
    name: wallet.name,
    address: wallet.address,
    pkey: AES.encrypt(wallet.pkey ? wallet.pkey : "", password).toString()
  }
}

const walletFromString = (wallet: WalletType, password: string) => {
  return {
    name: wallet.name,
    address: wallet.address,
    pkey: AES.decrypt(wallet.pkey ? wallet.pkey : "", password).toString(encUTF8)
  }
}

const walletListToJson = (walletList: Array<WalletType>, password: string) => {
  if (walletList)
    return JSON.stringify(walletList.map((wallet) => walletToString(wallet, password)))
}

const walletListFromJson = (walletList: string | null, password: string): WalletType[] | undefined => {
  if (walletList)
    return JSON.parse(walletList).map((wallet: WalletType) => walletFromString(wallet, password))
}

const walletConfigToJson = (walletConfig: WalletConfigType) => {
  if (walletConfig)
    return JSON.stringify(walletConfig)
}

const walletConfigFromJson = (walletConfig: string | null): WalletConfigType | undefined => {
  if (walletConfig)
    return JSON.parse(walletConfig)
}

const walletNiceName = (wallet: WalletType | undefined) => {
  if (wallet)
    return formatAddress(wallet.address, wallet.name)
  return ''
}

export type { WalletType, WalletConfigType }
export {
  walletListToJson,
  walletListFromJson,
  walletNiceName,
  walletConfigToJson,
  walletConfigFromJson
}
