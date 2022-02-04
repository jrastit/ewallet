import { useState, useEffect } from 'react';

import { Entity } from '../contract/model/Entity'
import { EntityRegistry } from '../contract/model/EntityRegistry'
import { WalletInfo } from '../type/walletInfo'
import { entityLoad } from '../util/entityStorage'

import { addEntityList, clearEntityList } from '../reducer/entityListSlice'

import SpaceWidget from '../component/spaceWidget'
import BoxWidget from '../component/boxWidget'
import BoxWidgetHide from '../component/boxWidgetHide'
import Container from 'react-bootstrap/Container';

import EntityRegistryWidget from '../entity/component/EntityRegistryWidget'
import EntityListWidget from '../entity/component/EntityListWidget'
import CreateEntityWidget from '../entity/component/createEntityWidget'

import DisplayEntity from '../section/displayEntity'


import 'bootstrap/dist/css/bootstrap.min.css';

import { useAppSelector, useAppDispatch } from '../hooks'

function DisplayEntityRegistry(props : {
  walletInfo : WalletInfo,
  setEntity: (entity: Entity | null) => void,
  entity: Entity | null | undefined,
}) {

  const [entityRegistry, setEntityRegistry] = useState<EntityRegistry>()

  const entityList = useAppSelector((state) => state.entityListSlice.entityList)
  const dispatch = useAppDispatch()

  const destroyEntityRegistry = () => {
    if (entityRegistry){
      entityRegistry.destroy && entityRegistry.destroy()
      setEntityRegistry(undefined)
    }
    dispatch(clearEntityList())
  }

  const updateEntityRegistry = (entityRegistry ?: EntityRegistry) => {
    console.log("here", entityRegistry)
    setEntityRegistry(entityRegistry)
    if (entityRegistry){
      entityRegistry.update && entityRegistry.update()
    }
  }

  const addEntityToList = (_entityRegistry: EntityRegistry, name: string, address: string) => {
    if (_entityRegistry === entityRegistry || 1)
      dispatch(addEntityList({ name, address }))
  }

  useEffect(() => {
    if (!props.walletInfo.transactionManager) {
      //getWallet(updateWalletMetamask, updateError)
      //addHooks()
    }else if (!props.entity) {
      entityLoad(props.walletInfo.transactionManager, entityRegistry).then((storageEntity) => {
        if (storageEntity) props.setEntity(storageEntity)
      })

    }
  })

  //const wallet = props.walletInfo.transactionManager
  //const provider = wallet ? wallet.provider : undefined

  return (
    <div className="App">
      <Container fluid>
          <>
          {!props.entity && !!props.walletInfo.transactionManager && !!props.walletInfo.networkName && !!props.walletInfo.address && (
            <>
            {entityRegistry &&
              <SpaceWidget>
              {
                entityList.length > 0 &&
                <BoxWidget title='Entity list'>
                <EntityListWidget
                  setEntity={props.setEntity}
                  entityRegistry={entityRegistry}
                />
                </BoxWidget>
              }
              <BoxWidgetHide title='Create New Entity' hide={entityList.length > 0}>
              <CreateEntityWidget
                setEntity={props.setEntity}
                networkName={props.walletInfo.networkName}
                transactionManager={props.walletInfo.transactionManager}
                address={props.walletInfo.address}
                entityRegistry={entityRegistry}
              />
              </BoxWidgetHide>
              </SpaceWidget>
            }
            <SpaceWidget>
              <BoxWidget title='Entity Registry'>
                <EntityRegistryWidget
                  addEntityToList={addEntityToList}
                  setEntity={props.setEntity}
                  networkName={props.walletInfo.networkName}
                  transactionManager={props.walletInfo.transactionManager}
                  address={props.walletInfo.address}
                  entityRegistry={entityRegistry}
                  setEntityRegistry={updateEntityRegistry}
                  clearEntityRegistry={destroyEntityRegistry}
                />
              </BoxWidget>
            </SpaceWidget>

            </>
          )}
          {!!props.entity && props.walletInfo.address &&
            <DisplayEntity
              entity={props.entity}
              walletInfo={props.walletInfo}
            />
          }
        </>

      </Container>

    </div>
  );
}

export default DisplayEntityRegistry;
