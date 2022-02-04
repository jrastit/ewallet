import { useState } from 'react'
import { EntityRegistry, AddEntityToList } from '../../contract/model/EntityRegistry'
import { EthersEntityRegistry } from '../../contract/ethers/EthersEntityRegistry'
import { Entity } from '../../contract/model/Entity'
import { Button } from 'react-bootstrap'
import {
  entityRegistryFromAddress,
  entityRegistryLoad,
  entityRegistryDelete,
  entityRegistryHasCache
} from '../../util/entityRegistryStorage'
import { getEntityRegistryAddress } from '../../util/networkInfo'
import BoxWidget from '../../component/boxWidget'
import BoxWidgetHide from '../../component/boxWidgetHide'
import AddressWidget from '../../component/addressWidget'
import { TransactionManager } from '../../util/TransactionManager'

const EntityRegistryWidget = (props: {
  addEntityToList: AddEntityToList,
  networkName: string,
  transactionManager: TransactionManager,
  address: string,
  setEntity: ((entity: Entity) => void),
  setEntityRegistry: ((entityRegistry: EntityRegistry | undefined) => void),
  clearEntityRegistry: () => void,
  entityRegistry: EntityRegistry | undefined
}) => {

  const [submit, setSubmit] = useState(0)
  const [loadAddress, setLoadAddress] = useState<string>()
  const [error, setError] = useState<string | null>()

  const entityRegistryAddress = getEntityRegistryAddress(props.networkName)
  const registryCache = entityRegistryHasCache(props.networkName)

  const deleteEntityRegistry = () => {
    entityRegistryDelete(props.networkName)
    props.setEntityRegistry(undefined)
  }

  const loadEntityRegistry = () => {
    setSubmit(1)
    props.clearEntityRegistry()
    entityRegistryLoad(props.networkName, props.addEntityToList, props.transactionManager).then(
      _entityRegistry => {
        if (_entityRegistry) {
          setSubmit(0)
          props.setEntityRegistry(_entityRegistry)
        } else {
          setError("error loading entity registry")
        }
      }

    ).catch((error) => {
      console.error(error)
      setError(error.message)
    })
  }

  const newEntityRegistry = () => {
    setSubmit(1)
    props.clearEntityRegistry()
    new EthersEntityRegistry({
      networkName: props.networkName,
      transactionManager: props.transactionManager,
      addEntityToList : props.addEntityToList,
    }).newContract('admin', 'admin', 'wallet').then(
      entityRegistry => { entityRegistry.init().then(_entityRegistry => {
      props.setEntityRegistry(_entityRegistry)
      setSubmit(0)
    }).catch((error) => {
      console.error(error)
      setError(error.message)
    })}).catch((error) => {
      console.error(error)
      setError(error.message)
    })
  }

  const loadEntityFirst = async (address : string) => {
    setSubmit(1)
    props.clearEntityRegistry()
    entityRegistryFromAddress(address, props.networkName, props.addEntityToList, props.transactionManager).then(
      (_entityRegistry) => {
        setSubmit(0)
        if (_entityRegistry){
          props.setEntityRegistry(_entityRegistry)
        }
      }
    ).catch((error) => {
      console.error(error)
      setError(error.message)
    })
  }

  if (error) return (
    <div>
      <label>{error}</label>&nbsp;&nbsp;
      <Button variant="danger" onClick={() => { setSubmit(0); setError(null) }}>Ok</Button>
    </div>
  )

  if (submit === 0) return (
    <>
      {props.entityRegistry && props.entityRegistry instanceof EthersEntityRegistry && (
        <BoxWidget>
          Entity Registry<br/>
          Address : <AddressWidget address={props.entityRegistry.getContract().address}/>
        </BoxWidget>
      )}

      {!props.entityRegistry &&
        <>
          { entityRegistryAddress &&
            <BoxWidget>
              <Button
                variant="info"
                onClick={() => loadEntityFirst(entityRegistryAddress)}>
                Load default entity registry
              </Button>
            </BoxWidget>
          }
          { registryCache &&
            <BoxWidget>
              <Button
                variant="info"
                onClick={loadEntityRegistry}>
                Load saved entity registry
              </Button>
            </BoxWidget>
          }
          <BoxWidgetHide title='Load entity from address'>
            <p>Enter Address : <input name="loadAddress" onChange={event => {setLoadAddress(event.target.value)}}></input></p>
            { !!loadAddress &&
              <Button onClick={() => {!!loadAddress && loadEntityFirst(loadAddress)}}>Load entity</Button>
            }
          </BoxWidgetHide>
          <BoxWidget>
            <Button
            variant="primary"
            onClick={newEntityRegistry}>
            Create entity registry for {props.networkName}
            </Button>
          </BoxWidget>
        </>
      }
      {props.entityRegistry &&
        <>
          <BoxWidget><Button variant="info" onClick={loadEntityRegistry}>Reload entity registry</Button></BoxWidget>
          <BoxWidget><Button variant="danger" onClick={deleteEntityRegistry}>Delte entity registry from cache</Button></BoxWidget>
        </>

      }
    </>
  )

  else if (submit === 1) return (
    <label>Creating or loading entity...</label>
  )
  else return (<div>
    <label>Operation done</label>&nbsp;&nbsp;
    <Button variant="primary" onClick={() => { setSubmit(0) }}>Ok</Button>
  </div>)
}

export default EntityRegistryWidget
