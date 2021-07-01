import { useState, useEffect } from 'react';
import { ethers } from 'ethers'
import logo from './logo.svg';
import './App.css';
import AppNav from './AppNav'
import {
  Entity,
} from './class/Entity'

import {
  localEntityLoad,
} from './class/LocalEntity'

import AdminEntity from './section/adminEntity'
import AdminUser from './section/adminUser'
import BoxWidget from './component/boxWidget'
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import DisplayEntityOperationList from './component/display/displayEntityOperationList'
import CreateEntityWidget from './component/admin/createEntityWidget'
import PayEntity from './component/transaction/payEntityWidget'
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
  const [entity, setEntity] = useState<Entity | null | undefined>(null)
  const [userId, setUserId] = useState(-1)

  if (walletInfo.wallet && entity) {
    entity.getUserIdFromAddress(walletInfo.address).then(
      (_userId) => {
        if (_userId !== userId) {
          setUserId(_userId)
        }
      }
    ).catch((err) => setUserId(-1))
  }

  const updateAddress = (_address: string, _wallet: ethers.Wallet | undefined) => {
    console.log("address", _address)
    if (walletInfo.address !== _address) {
      setWalletInfo({ address: _address, wallet: _wallet, error: undefined })
    }
  }

  const updateWallet = (networkName: string, _wallet: ethers.Wallet) => {
    getAddress(networkName, _wallet, updateAddress)
  }

  const updateError = (_error: string) => {
    console.error("error : ", _error)
    setWalletInfo({ address: "error", wallet: undefined, error: _error })
  }

  if (!entity) {
    const storageEntity = localEntityLoad()
    if (storageEntity) setEntity(storageEntity)
  }

  useEffect(() => {
    if (!walletInfo.wallet) {
      getWallet(networkName, updateWallet, updateError)
      addHooks()
    }
  })

  //const wallet = walletInfo.wallet
  //const provider = wallet ? wallet.provider : undefined

  return (
    <div className="App">
      <Container>
        {!isHome && <AppNav
          setIsHome={setIsHome}
          setEntity={setEntity}
          entity={entity}
          networkName={networkName}
          address={walletInfo.address}
          error={walletInfo.error}
        />}

        {(!!isHome || !entity) &&
          <BoxWidget>
            <img src={logo} className="App-logo" alt="logo" />
          </BoxWidget>
        }
        {!!isHome &&
          <div>
            <BoxWidget title="EWallet">
              <p>Non-custodial wallet for entreprise</p>
              <Button onClick={() => setIsHome(0)}>
                Enter
              </Button>
            </BoxWidget>
          </div>
        }

        {!isHome && !entity && !!walletInfo.wallet &&
          <BoxWidget title='Create Entity'>
            <CreateEntityWidget
              setEntity={setEntity}
              networkName={networkName}
              address={walletInfo.address}
            />
          </BoxWidget>
        }
        {!isHome && !!entity && userId >= 0 &&
          <Row>
            <Col><AdminEntity userId={userId} entity={entity} /></Col>
            <Col><AdminUser userId={userId} entity={entity} /></Col>
            <Col>
              <BoxWidget title='Pay entity'>
                <PayEntity userId={userId} entity={entity} address={walletInfo.address}/>
              </BoxWidget>
              <BoxWidget title='Entity operation'>
                <DisplayEntityOperationList entity={entity} />
              </BoxWidget>
            </Col>
          </Row>
        }
        {!isHome && !!entity && userId < 0 &&
          <Row>
            <Col>
              <BoxWidget title='Pay entity'>
                <PayEntity userId={userId} entity={entity} address={walletInfo.address}/>
              </BoxWidget>
            </Col>
          </Row>
        }
      </Container>

    </div>
  );
}

export default App;
