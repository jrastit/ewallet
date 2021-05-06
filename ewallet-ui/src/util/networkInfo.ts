import { ethers } from 'ethers'

import {
    getNetworkConfig,
} from '../util/configNetwork'

declare global {
    interface Window { ethereum: any; }
}

const addHooks = () => {
    window.ethereum.on('chainChanged', (_chainId : number) => window.location.reload());
    window.ethereum.on('accountsChanged', (accounts: Array<string>) => {console.log(accounts);window.location.reload()});
}

const getWallet = (
  networkName : string,
  setWallet : (
    networkName: string,
    wallet : ethers.Wallet
  ) => void, setError : (error : string) => void) => {
    const {
      chainId,
    } = getNetworkConfig(networkName)
    const web3Provider = new ethers.providers.Web3Provider(
        window.ethereum,
        {
            name : networkName,
            chainId : chainId
        })
        web3Provider.getNetwork().then(
        (network) => {
            if (network.chainId !== chainId) {
                setError("Wrong network in Metamask, please use " +
                    networkName +
                    "(" +
                    chainId +
                    ")"
                )
            } else {
                const wallet : any = web3Provider.getSigner()
                setWallet(networkName, wallet)
            }
        }).catch((error) => {
            console.error("error in get network ", error)
            setError("Wrong network in Metamask, please use " +
                networkName +
                " (" +
                chainId +
                ")"
            )
        })
}

const getAddress = (
  networkName : string,
  wallet : ethers.Wallet,
  setAddress : (address : string, wallet : ethers.Wallet | undefined) => void
) => {
    wallet.getAddress().then(
        (address) => {
            setAddress(address, wallet)
        }).catch(
            err => {
                console.log("error in get address ", err)
                setAddress("error", undefined)
            }
        )
}

const getBalance = async (
  networkName : string,
  wallet : ethers.Wallet,
  address : string,
  setBalance : (balance : ethers.BigNumber) => void
) => {
    wallet.provider.getBalance(address).then(
        (balance) => {
        //console.log("balance", balance)
            setBalance(balance)
        }).catch(err => console.log("error in get balance ", err))
}

export {
    addHooks,
    getWallet,
    getBalance,
    getAddress,
}
