import { useState, useEffect, Fragment } from 'react';
import { ethers } from 'ethers'
import logo from './logo.png';
import './App.css';
import AppNav from './AppNav'
import { Entity } from './class/Entity'
import { EntityRegistry } from './class/EntityRegistry'

import {
  entityLoad,
} from './util/entityStorage'

import AdminEntity from './section/adminEntity'
import AdminMember from './section/adminMember'
import BoxWidget from './component/boxWidget'
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import DisplayEntityOperationList from './component/display/displayEntityOperationList'
import PayEntity from './component/transaction/payEntityWidget'
import EntityRegistryWidget from './component/entity/EntityRegistryWidget'
import EntityListWidget from './component/entity/EntityListWidget'
import CreateEntityWidget from './component/admin/createEntityWidget'

import {
  getAddress,
  getWallet,
  addHooks,
} from './util/networkInfo'
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [isHome, setIsHome] = useState(1);
  const [walletInfo, setWalletInfo] = useState<{
    networkName : string | undefined,
    address: string,
    wallet: ethers.Wallet | undefined,
    error: string | undefined
  }>({
    networkName : undefined,
    address: "Loading...",
    wallet: undefined,
    error: undefined,
  })
  const [entityRegistry, setEntityRegistry] = useState<EntityRegistry>()
  const [entity, setEntity] = useState<Entity | null | undefined>(null)
  const [memberId, setMemberId] = useState(-1)

  if (walletInfo.wallet && entity) {
    entity.getMemberIdFromAddress(walletInfo.address).then(
      (_memberId) => {
        if (_memberId !== memberId) {
          setMemberId(_memberId)
        }
      }
    ).catch((err) => setMemberId(-1))
  }

  const updateAddress = (_networkName : string | undefined, _address: string, _wallet: ethers.Wallet | undefined) => {
    console.log("address", _address)
    if (walletInfo.address !== _address) {
      setWalletInfo({
        networkName : _networkName,
        address: _address,
        wallet: _wallet,
        error: undefined
      })
    }
  }

  const updateWallet = (networkName: string, _wallet: ethers.Wallet) => {
    getAddress(networkName, _wallet, updateAddress)
  }

  const updateError = (_error: string) => {
    console.error("error : ", _error)
    setWalletInfo({networkName:undefined, address: "error", wallet: undefined, error: _error })
  }

  useEffect(() => {
    if (!walletInfo.wallet) {
      getWallet(updateWallet, updateError)
      addHooks()
    }else if (!entity) {
      entityLoad(walletInfo.wallet).then((storageEntity) => {
        if (storageEntity) setEntity(storageEntity)
      })

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
          networkName={walletInfo.networkName}
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

        {!isHome && !entity && !!walletInfo.wallet && !!walletInfo.networkName &&
          <BoxWidget title='Select Entity Registry'>
            <EntityRegistryWidget
              setEntity={setEntity}
              networkName={walletInfo.networkName}
              signer={walletInfo.wallet}
              address={walletInfo.address}
              entityRegistry={entityRegistry}
              setEntityRegistry={setEntityRegistry}
            />
          </BoxWidget>
        }
        {!isHome && !entity && entityRegistry && !!walletInfo.wallet && !!walletInfo.networkName &&
          <Fragment>
          <BoxWidget title='Entity liste'>
          <EntityListWidget
            setEntity={setEntity}
            entityRegistry={entityRegistry}
          />
          </BoxWidget>
          <BoxWidget title='Create New Entity'>
          <CreateEntityWidget
            setEntity={setEntity}
            networkName={walletInfo.networkName}
            signer={walletInfo.wallet}
            address={walletInfo.address}
            entityRegistry={entityRegistry}
          />
          </BoxWidget>
          </Fragment>
        }
        {!isHome && !!entity && memberId >= 0 &&
          <Row>
            <Col><AdminEntity memberId={memberId} entity={entity} /></Col>
            <Col><AdminMember memberId={memberId} entity={entity} /></Col>
            <Col>
              <BoxWidget title='Pay entity'>
                <PayEntity memberId={memberId} entity={entity} address={walletInfo.address}/>
              </BoxWidget>
              <BoxWidget title='Entity operation'>
                <DisplayEntityOperationList entity={entity} />
              </BoxWidget>
            </Col>
          </Row>
        }
        {!isHome && !!entity && memberId < 0 &&
          <Row>
            <Col>
              <BoxWidget title='Pay entity'>
                <PayEntity memberId={memberId} entity={entity} address={walletInfo.address}/>
              </BoxWidget>
            </Col>
          </Row>
        }
      </Container>

    </div>
  );
}

export default App;
