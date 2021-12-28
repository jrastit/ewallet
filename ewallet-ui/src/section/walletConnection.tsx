import { ethers } from 'ethers'
import Button from 'react-bootstrap/Button';
import logo from '../images/logo.png';
import BoxWidget from '../component/boxWidget'
import { walletListLoadAddress } from '../util/walletStorage'
import DisplayWalletList from '../component/wallet/displayWalletList'
import {
  getAddress,
  getWallet,
  addHooks,
} from '../util/networkInfo'

import { WalletInfo } from '../type/walletInfo'

const WalletConnection = (props: {
  walletInfo : WalletInfo,
  setWalletInfo : (walletInfo : WalletInfo) => void
  setIsHome : (isHome : number) => void
}) => {

  const updateAddress = (_networkName : string | undefined, _address: string, _wallet: ethers.Wallet | undefined) => {
    console.log("address", _address)
    if (props.walletInfo.address !== _address) {
      props.setWalletInfo({
        type : 'Metamask',
        name : undefined,
        networkName : _networkName,
        address : _address,
        wallet : _wallet,
        error : undefined
      })
    }
  }

  const updateWalletMetamask = (networkName: string, _wallet: ethers.Wallet) => {
    getAddress(networkName, _wallet, updateAddress)
  }

  const updateWalletBroswer = async (walletAddress : string | undefined) => {
    if (walletAddress){
      const wallet = await walletListLoadAddress(walletAddress)
      if (wallet){
        props.setWalletInfo({
          type : 'Broswer',
          name : wallet.name,
          networkName : props.walletInfo.networkName,
          address : wallet.address,
          wallet : wallet.pkey ? new ethers.Wallet(wallet.pkey) : undefined,
          error : undefined
        })
        return
      }
    }
    props.setWalletInfo({
      type : 'Broswer',
      name : undefined,
      networkName : props.walletInfo.networkName,
      address : "undefined",
      wallet : undefined,
      error : undefined
    })
  }

  const updateNetworkBroswer = (networkName : string | undefined) => {
    props.setWalletInfo({
      type : 'Broswer',
      name : props.walletInfo.name,
      networkName,
      address : props.walletInfo.address,
      wallet : props.walletInfo.wallet,
      error : undefined
    })
  }

  const updateError = (_error: string) => {
    console.error("error : ", _error)
    props.setWalletInfo({
      type : "Metamask",
      name : undefined,
      networkName: undefined,
      address : "error",
      wallet : undefined,
      error : _error
    })
  }

  const setWalletType = (type : string) => {
    if (type === 'Metamask'){
      getWallet(updateWalletMetamask, updateError)
      addHooks()
    } else if (type === 'Broswer') {
      props.setWalletInfo({
        type,
        name : undefined,
        networkName : undefined,
        address : "Loading...",
        wallet : undefined,
        error : undefined
      })
    } else {
      props.setWalletInfo({
        type : undefined,
        name : undefined,
        networkName : undefined,
        address : "Loading...",
        wallet : undefined,
        error : undefined
      })
    }

  }


    return (
      <>
      { (!props.walletInfo.type) &&
        <>
        <BoxWidget>
          <img src={logo} className="App-logo" alt="logo" />
        </BoxWidget>
        <BoxWidget title="EWallet">
          <p>Non-custodial wallet for entreprise</p>
        </BoxWidget>
        <BoxWidget>
          <p>Use wallet and network configured within Metamask</p>
          <p><a href='https://metamask.io/'>get Metamask here</a></p>
          <Button onClick={() => setWalletType('Metamask')}>
            Enter with Metamask
          </Button>
        </BoxWidget>
        <BoxWidget>
          <p>Use your internet broswer cache to keep your wallet</p>
          <Button onClick={() => setWalletType('Broswer')}>
            Enter with broswer wallet
          </Button>
        </BoxWidget>
        </>
      }
      { (props.walletInfo.type === 'Metamask') &&
        <>
        <BoxWidget title='Metamask'>
          <p>network : {props.walletInfo.networkName ? props.walletInfo.networkName : "loading ..."}</p>
          <p>address : {props.walletInfo.address ? props.walletInfo.address : "loading ..."}</p>
          <Button onClick={() => props.setIsHome(0)}>Ok</Button>
        </BoxWidget>
        <BoxWidget>
          <Button onClick={() => setWalletType('')}>Disconnect</Button>
        </BoxWidget>
        </>
      }
      { (props.walletInfo.type === 'Broswer') &&
        <>
        <DisplayWalletList
          walletName={props.walletInfo.name}
          networkName={props.walletInfo.networkName}
          walletAddress={props.walletInfo.address}
          updateWalletBroswer={updateWalletBroswer}
          updateNetworkBroswer={updateNetworkBroswer}
          />
        <BoxWidget>
          <Button onClick={() => props.setIsHome(0)}>Ok</Button>
        </BoxWidget>
        <BoxWidget>
          <Button onClick={() => setWalletType('')}>Disconnect</Button>
        </BoxWidget>
        </>
      }
    </>
    )
}

export default WalletConnection
