import { useState, useEffect } from 'react';


import './App.css';
import AppNav from './AppNav'
import { Entity } from './class/Entity'
import { EntityRegistry } from './class/EntityRegistry'
import { WalletInfo } from './type/walletInfo'
import { entityLoad } from './util/entityStorage'

import WalletConnection from './section/walletConnection'
import AdminEntity from './section/adminEntity'
import AdminMemberList from './section/adminMemberList'
import AdminMember from './section/adminMember'
import EntityTransfer from './section/entityTransfer'
import SpaceWidget from './component/spaceWidget'
import BoxWidget from './component/boxWidget'
import BoxWidgetHide from './component/boxWidgetHide'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import DisplayEntityOperationList from './component/display/displayEntityOperationList'

import EntityRegistryWidget from './component/entity/EntityRegistryWidget'
import EntityListWidget from './component/entity/EntityListWidget'
import CreateEntityWidget from './component/admin/createEntityWidget'

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [isHome, setIsHome] = useState(1);

  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    type : undefined,
    name : undefined,
    networkName : undefined,
    address: undefined,
    wallet: undefined,
    error: undefined,
  })
  const [entityRegistry, setEntityRegistry] = useState<EntityRegistry>()
  const [entity, _setEntity] = useState<Entity | null | undefined>(null)
  const [memberId, setMemberId] = useState(-1)
  const [password, setPassword] = useState<string | null>()

  const setEntity = async (entity : Entity | null | undefined) => {
    console.log("setEntity\n" + (entity ? (await entity.getInfoTxt()) : "null"))
    _setEntity(entity);
  }

  const refreshEntity = async () => {
    entity && entity.update()
  }

  if (walletInfo.wallet && walletInfo.address && entity) {
    entity.getMemberIdFromAddress(walletInfo.address).then(
      (_memberId) => {
        if (_memberId !== memberId) {
          setMemberId(_memberId)
        }
      }
    ).catch((err) => {
      console.log(err);
      setMemberId(-1);
    })
  }

  useEffect(() => {
    if (!walletInfo.wallet) {
      //getWallet(updateWalletMetamask, updateError)
      //addHooks()
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
          <div className="flexCentered">
          <div>
          <WalletConnection
            password={password}
            setPassword={setPassword}
            walletInfo={walletInfo}
            setWalletInfo={setWalletInfo}
            setIsHome={setIsHome}
          />
          </div>
          </div>
        }


        { !isHome && (
          <>
          {!entity && !!walletInfo.wallet && !!walletInfo.networkName && !!walletInfo.address && (
            <>
            {entityRegistry &&
              <SpaceWidget>
              {
                entityRegistry.entityList.length > 0 &&
                <BoxWidget title='Entity list'>
                <EntityListWidget
                  setEntity={setEntity}
                  entityRegistry={entityRegistry}
                />
                </BoxWidget>
              }
              <BoxWidgetHide title='Create New Entity' hide={entityRegistry.entityList.length > 0}>
              <CreateEntityWidget
                setEntity={setEntity}
                networkName={walletInfo.networkName}
                signer={walletInfo.wallet}
                address={walletInfo.address}
                entityRegistry={entityRegistry}
              />
              </BoxWidgetHide>
              </SpaceWidget>
            }
            <SpaceWidget>
              <BoxWidget title='Entity Registry'>
                <EntityRegistryWidget
                  setEntity={setEntity}
                  networkName={walletInfo.networkName}
                  signer={walletInfo.wallet}
                  address={walletInfo.address}
                  entityRegistry={entityRegistry}
                  setEntityRegistry={setEntityRegistry}
                />
              </BoxWidget>
            </SpaceWidget>

            </>
          )}
          {!!entity && walletInfo.address &&
            <Row>
              <Col>
                <AdminEntity memberId={memberId} entity={entity} refreshEntity={refreshEntity}/>
                <AdminMemberList memberId={memberId} entity={entity} />
              </Col>
              { memberId > -1 &&
              <Col><AdminMember memberId={memberId} entity={entity} /></Col>
              }
              <Col>
                <EntityTransfer  memberId={memberId} entity={entity} walletInfo={walletInfo} />
              </Col><Col>
              <SpaceWidget>
                <BoxWidget title='Entity operation'>
                  <DisplayEntityOperationList entity={entity} />
                </BoxWidget>
              </SpaceWidget>
              </Col>
            </Row>
          }
        </>)}



      </Container>

    </div>
  );
}

export default App;
