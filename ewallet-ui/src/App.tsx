import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers'
import logo from './logo.svg';
import './App.css';
import WalletWidget from './component/walletWidget'
import AdminEntity from './section/adminEntity'
import BoxWidget from './component/boxWidget'
import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import {
  getAddress,
  getWallet,
  addHooks,
} from './util/networkInfo'
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  //const [networkName, setNetworkName] = useState('kovan')
  const networkName = 'kovan'
  const [isHome, setIsHome] = useState(1);
  const [walletInfo, setWalletInfo] = useState<{
    address: string,
    wallet: ethers.Wallet | undefined
    error: string | undefined
  }>({
    address: "Loading...",
    wallet: undefined,
    error: undefined,
  })

  const updateAddress = (_address : string, _wallet : ethers.Wallet | undefined) => {
    console.log("address", _address)
    if (walletInfo.address !== _address) {
      setWalletInfo({ address: _address, wallet: _wallet, error: undefined })
    }
  }

  const updateWallet = (networkName : string, _wallet : ethers.Wallet) => {
    getAddress(networkName, _wallet, updateAddress)
  }

  const updateError = (_error : string) => {
    console.log("error : ", _error)
    setWalletInfo({ address: "error", wallet: undefined, error: _error })
  }

  useEffect(() => {
        if (!walletInfo.wallet){
            getWallet(networkName, updateWallet, updateError)
            addHooks()
        }
    })

  //const wallet = walletInfo.wallet
  //const provider = wallet ? wallet.provider : undefined

  return (
    <div className="App">
      <header className="App-header">
        <Container>
        {!!isHome &&
          <Jumbotron>
            <img src={logo} className="App-logo" alt="logo" />
            <BoxWidget title="EWallet">
            <p>Non-custodial wallet for entreprise</p>
            <Button onClick={() => setIsHome(0)}>
              Enter
            </Button>
            </BoxWidget>
          </Jumbotron>
        }
        {!isHome &&
          <div>
            <BoxWidget>
              <Button onClick={() => setIsHome(1)}>Home</Button>
            </BoxWidget>
            <BoxWidget title="Wallet">
              <WalletWidget address={walletInfo.address} error={walletInfo.error}/>
            </BoxWidget>
            <div>
              <AdminEntity/>
            </div>
          </div>
        }
        </Container>
      </header>
    </div>
  );
}

export default App;
