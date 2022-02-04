import { ethers } from 'ethers'
import { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import logo from '../images/logo.png'
import BoxWidget from '../component/boxWidget'
import SpaceWidget from '../component/spaceWidget'
import AddressWidget from '../component/addressWidget'
import WalletDeleteAll from '../component/wallet/walletDeleteAll'
import NetworkSelectWidget from '../component/wallet/networkSelectWidget'
import WalletSelectWidget from '../component/wallet/walletSelectWidget'
import { TransactionManager } from '../util/TransactionManager'

import WalletPassword from '../component/wallet/walletPassword'
import {
  walletListLoadAddress,
  walletConfigLoad,
  walletConfigSave,
  walletConfigUpdatePassword,
} from '../util/walletStorage'

import {
  getAddress,
  getWallet,
  addHooks,
  getProvider,
} from '../util/networkInfo'

import { WalletInfo } from '../type/walletInfo'

const WalletConnection = (props: {
  password?: string | null
  walletInfo: WalletInfo
  setWalletInfo: (walletInfo: WalletInfo) => void
  setPassword: (password: string) => void
  setIsHome: (isHome: number) => void
}) => {


  const [error, setError] = useState<string | null>()
  const [balance, setBalance] = useState<ethers.BigNumber | undefined>()
  const [walletConfig, setWalletConfig] = useState(walletConfigLoad())

  const setWalletInfo = (walletInfo: WalletInfo) => {
    props.setWalletInfo(walletInfo)
  }

  useEffect(() => {
    if (props.walletInfo.type !== walletConfig.walletType) {
      setWalletType(walletConfig.walletType)
      return
    }
    if (walletConfig.password) {
      if (props.password !== walletConfig.password)
        props.setPassword(walletConfig.password)
      return
    }
  })

  const setWalletType = (type?: string) => {
    if (walletConfig.walletType !== type){
      walletConfig.walletType = type
      walletConfigSave(walletConfig)
      setWalletConfig(walletConfig)
    }
    if (type === 'Metamask') {
      getWallet(updateWalletMetamask, updateError)
      addHooks()
    } else {
      setWalletInfo({
        type,
      })
    }
  }

  const updateAddressMetamask = (_networkName: string | undefined, _address: string, _wallet: ethers.Wallet | undefined) => {
    console.log("address", _address)
    if (props.walletInfo.address !== _address) {
      setWalletInfo({
        type: 'Metamask',
        networkName: _networkName,
        address: _address,
        transactionManager: _wallet && new TransactionManager(_wallet),
      })
    }
  }

  const setPassword = (password: string, remember: boolean) => {
    if (remember) {
      walletConfig.password = password
      walletConfigSave(walletConfig)
      setWalletConfig(walletConfig)
    }
    props.setPassword(password)
  }

  const newPassword = (password: string, passwordCheck: string, remember: boolean) => {
    if (remember) {
      setWalletConfig(walletConfigUpdatePassword(password, passwordCheck))
    } else {
      setWalletConfig(walletConfigUpdatePassword(undefined, passwordCheck))
      props.setPassword(password)
      setWalletType('Broswer')
    }
  }

  const updateWalletMetamask = (networkName: string, _wallet: ethers.Wallet) => {
    getAddress(networkName, _wallet, updateAddressMetamask)
  }

  const updateWalletBroswer = async (
    walletAddress: string | undefined,
  ) => {
    updateWalletNetworkBroswer(walletAddress, props.walletInfo.networkName)
  }

  const updateNetworkBroswer = (networkName: string | undefined) => {
    updateWalletNetworkBroswer(props.walletInfo.address, networkName)
  }

  const updateWalletNetworkBroswer = async (
    walletAddress: string | undefined,
    networkName: string | undefined,
  ) => {
    if (walletConfig.walletAddress !== walletAddress || walletConfig.networkName !== networkName){
      walletConfig.walletAddress = walletAddress
      walletConfig.networkName = networkName
      walletConfigSave(walletConfig)
      setWalletConfig(walletConfig)
    }
    let name
    let address
    let transactionManager
    let error
    if (walletAddress && props.password) {
      const broswerWallet = await walletListLoadAddress(walletAddress, props.password)
      if (broswerWallet) {
        if (broswerWallet.pkey) {
          const provider = await getProvider(networkName, setError)
          if (provider) {
            transactionManager = new TransactionManager(new ethers.Wallet(
              broswerWallet.pkey,
              provider
            ))
            transactionManager.signer.getBalance().then(setBalance).catch(setError)
          }
        }
        name = broswerWallet.name
        address = broswerWallet.address
      }
    }
    setWalletInfo({
      type: 'Broswer',
      name,
      networkName,
      address,
      transactionManager,
      error
    })
  }

  const updateError = (_error: string) => {
    console.error("error : ", _error)
    setWalletInfo({
      type: "Metamask",
      error: _error
    })
  }

  if (error) return (
    <div>
      <label>{error}</label>&nbsp;&nbsp;
      <Button variant="danger" onClick={() => { setError(null) }}>Ok</Button>
    </div>
  )

  return (
    <>
      {(!props.walletInfo.type || (props.walletInfo.type === "Broswer" && !props.password)) &&
        <>
          <SpaceWidget>
            <BoxWidget>
              <img src={logo} className="App-logo" alt="logo" />
            </BoxWidget>
            <BoxWidget>
              <p>Non-custodial wallet for entreprise</p>
            </BoxWidget>
          </SpaceWidget>
          <SpaceWidget>
            <BoxWidget title='Metamask'>
              <p>Use wallet and network configured within Metamask</p>
              <p><a href='https://metamask.io/'>get Metamask here</a></p>
              <SpaceWidget>
              <Button onClick={() => setWalletType('Metamask')}>
                Enter with Metamask
                </Button>
              </SpaceWidget>
            </BoxWidget>
          </SpaceWidget>
          <SpaceWidget>
            <BoxWidget title='Broswer'>
              <p>Use your internet broswer cache to keep your wallet</p>
              {!!props.password &&
                  <>
                  <SpaceWidget>
                  <Button onClick={() => setWalletType('Broswer')}>
                    Enter with broswer wallet
                  </Button>
                  </SpaceWidget>
                  <SpaceWidget>
                    <Button variant="warning" onClick={() => {
                      walletConfig.password = undefined
                      walletConfigSave(walletConfig)
                      window.location.reload()
                    }}>Disconnect</Button>
                  </SpaceWidget>
                  </>
              }
              {!props.password &&
                <SpaceWidget>
                <WalletPassword
                  passwordCheck={walletConfig.passwordCheck}
                  setPassword={setPassword}
                  newPassword={newPassword}
                />
                </SpaceWidget>
              }

              </BoxWidget>
              {!!walletConfig.passwordCheck &&
                <WalletDeleteAll />
              }
          </SpaceWidget>
        </>
      }
      {(props.walletInfo.type === 'Metamask') &&
        <SpaceWidget>
          <BoxWidget title='Metamask'>
            <p>network : {props.walletInfo.networkName ? props.walletInfo.networkName : "loading ..."}</p>
            <p>address : <AddressWidget address={props.walletInfo.address ? props.walletInfo.address : "loading ..."}/></p>
            <Button onClick={() => props.setIsHome(0)}>Ok</Button>
          </BoxWidget>
          <BoxWidget>
            <Button variant="warning" onClick={() => setWalletType()}>Home</Button>
          </BoxWidget>
        </SpaceWidget>
      }
      {!!props.password && (props.walletInfo.type === 'Broswer') &&
        <>
          <SpaceWidget>
            <BoxWidget title="Select network">
              <NetworkSelectWidget
                walletValue={props.walletInfo.networkName}
                value={props.walletInfo.networkName || walletConfig.networkName}
                setNetwork={updateNetworkBroswer}
              />
            </BoxWidget>
          </SpaceWidget>
          <SpaceWidget>
            <WalletSelectWidget
              balance={balance}
              password={props.password}
              walletValue={props.walletInfo.address}
              value={props.walletInfo.address || walletConfig.walletAddress}
              setWallet={updateWalletBroswer}
              setIsHome={props.setIsHome}
            />
          </SpaceWidget>
          <SpaceWidget>
            <BoxWidget>
              <Button variant="warning" onClick={() => setWalletType()}>Home</Button>
            </BoxWidget>
          </SpaceWidget>
        </>
      }
    </>
  )
}

export default WalletConnection
