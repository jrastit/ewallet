import { ethers } from 'ethers'

import { network as networkList } from '../config/network.json'
import { NetworkType } from '../type/networkType'
import { WalletType } from '../type/walletType'
import { walletListLoad } from '../util/walletStorage'

declare global {
  interface Window {
    ethereum: any;
  }
}

const getNetworkList = async (): Promise<NetworkType[]> => {
  return networkList.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
}

const getWalletList = async (): Promise<WalletType[] | undefined> => {
  return await walletListLoad()
}

const addHooks = () => {
  window.ethereum.on('chainChanged', (_chainId: number) => window.location.reload());
  window.ethereum.on('accountsChanged', (accounts: Array<string>) => { console.log(accounts); window.location.reload() });
}

const getEntityRegistryAddress = (
  networkName: string,
) => {
  return (networkList as NetworkType[]).filter((_networkItem) => _networkItem.name === networkName).map((_networkItem) => _networkItem.entityRegistryAddress)[0]
}

const getWallet = (
  setWallet: (
    networkName: string,
    wallet: ethers.Wallet
  ) => void, setError: (error: string) => void) => {
  const web3Provider = new ethers.providers.Web3Provider(
    window.ethereum)
  web3Provider.getNetwork().then(
    (network) => {
      const wallet: any = web3Provider.getSigner()
      let networkName = network.name
      if (networkName === 'unknown') {
        const chainId = network.chainId
        networkName = networkList.filter((_networkItem) => _networkItem.chainId === chainId).map((_networkItem) => _networkItem.name)[0]
        if (!networkName) networkName = network.chainId.toString()
      }
      setWallet(networkName, wallet)
    }).catch((error) => {
      console.error("error in get network ", error)
      setError("Error in Metamask : " + error.message)
    })
}

const getAddress = (
  networkName: string,
  wallet: ethers.Wallet,
  setAddress: (networkName: string | undefined, address: string, wallet: ethers.Wallet | undefined) => void
) => {
  wallet.getAddress().then(
    (address) => {
      setAddress(networkName, address, wallet)
    }).catch(
      err => {
        console.error("error in get address ", err)
        setAddress(undefined, "error", undefined)
      }
    )
}

const getBalance = async (
  wallet: ethers.Wallet,
  address: string,
  setBalance: (balance: ethers.BigNumber) => void
) => {
  wallet.provider.getBalance(address).then(
    (balance) => {
      setBalance(balance)
    }).catch(err => console.error("error in get balance ", err))
}

export {
  addHooks,
  getWallet,
  getBalance,
  getAddress,
  getEntityRegistryAddress,
  getNetworkList,
  getWalletList,
}
