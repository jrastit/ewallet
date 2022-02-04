import { useState } from 'react';

import './App.css';
import AppNav from './AppNav'

import { WalletInfo } from './type/walletInfo'
import { Entity } from './contract/model/Entity'

import Container from 'react-bootstrap/Container';

import WalletConnection from './section/walletConnection'
import DisplayEntityRegistry from './section/displayEntityRegistry'



import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [isHome, setIsHome] = useState(1);

  const [walletInfo, setWalletInfo] = useState<WalletInfo>({})



  const [password, setPassword] = useState<string | null>()

  const [entity, _setEntity] = useState<Entity | null | undefined>(null)
  //const wallet = walletInfo.transactionManager
  //const provider = wallet ? wallet.provider : undefined

  const setEntity = async (entity : Entity | null | undefined) => {
    console.log("setEntity\n" + (entity && entity.getInfoTxt ? (await entity.getInfoTxt()) : "null"))
    _setEntity(entity);
  }

  return (
    <div className="App">
      <Container fluid>
        {!isHome && <AppNav
          setIsHome={setIsHome}
          setEntity={setEntity}
          entity={entity}
          networkName={walletInfo.networkName}
          address={walletInfo.address}
          error={walletInfo.error}
        />}
        { (!!isHome) &&
          <WalletConnection
            password={password}
            setPassword={setPassword}
            walletInfo={walletInfo}
            setWalletInfo={setWalletInfo}
            setIsHome={setIsHome}
          />
        }


        { !isHome && !!walletInfo.transactionManager && !!walletInfo.networkName && !!walletInfo.address && (
            <DisplayEntityRegistry
              walletInfo={walletInfo}
              setEntity={setEntity}
              entity={entity}
              />
        )}

      </Container>

    </div>
  );
}

export default App;
