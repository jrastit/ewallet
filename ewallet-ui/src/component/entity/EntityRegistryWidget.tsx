import { useState, useEffect } from 'react'
import { EntityRegistry } from '../../class/EntityRegistry'
import { Entity } from '../../class/Entity'
import { ethers } from 'ethers'
import { Button } from 'react-bootstrap'
import { entityRegistryFromAddress, entityRegistryLoad, entityRegistryDelete, entityRegistryHasCache } from '../../util/entityRegistryStorage'
import { getEntityRegistryAddress } from '../../util/networkInfo'
import BoxWidget from '../boxWidget'
import AddressWidget from '../addressWidget'


const EntityRegistryWidget = (props: {
  networkName: string,
  signer: ethers.Signer,
  address: string,
  setEntity: ((entity: Entity) => void),
  setEntityRegistry: ((entityRegistry: EntityRegistry | undefined) => void),
  entityRegistry: EntityRegistry | undefined
}) => {

  const [submit, setSubmit] = useState(0)
  const [error, setError] = useState<string | null>()

  const entityRegistryAddress = getEntityRegistryAddress(props.networkName)
  const registryCache = entityRegistryHasCache(props.networkName)

  const deleteEntityRegistry = () => {
    entityRegistryDelete(props.networkName)
    props.setEntityRegistry(undefined)
  }

  const loadEntityRegistry = () => {
    setSubmit(1)

    entityRegistryLoad(props.networkName, props.signer).then(
      _entityRegistry => {
        if (_entityRegistry) {
          setSubmit(2)
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
    new EntityRegistry({
      networkName: props.networkName,
      signer: props.signer,
    }).init().then(_entityRegistry => {
      props.setEntityRegistry(_entityRegistry)
      setSubmit(2)
    }).catch((error) => {
      console.error(error)
      setError(error.message)
    })
  }

  const loadEntityFirst = async () => {
    setSubmit(1)
    entityRegistryFromAddress(entityRegistryAddress, props.networkName, props.signer).then(
      (_entityRegistry) => {
        setSubmit(2)
        if (_entityRegistry){
          props.setEntityRegistry(_entityRegistry)
        }
      }
    ).catch((error) => {
      console.error(error)
      setError(error.message)
    })
  }

  useEffect(() => {

  })

  if (error) return (
    <div>
      <label>{error}</label>&nbsp;&nbsp;
      <Button variant="danger" onClick={() => { setSubmit(0); setError(null) }}>Ok</Button>
    </div>
  )

  if (submit === 0) return (
    <>
      {props.entityRegistry && (
        <BoxWidget>Entity Registry<br/>Address : <AddressWidget address={props.entityRegistry.contractAddress}/></BoxWidget>
      )}

      {!props.entityRegistry &&
        <>
          { entityRegistryAddress &&
            <div><Button variant="info" onClick={loadEntityFirst}>Load default entity registry</Button><br/><br/></div>
          }
          { registryCache &&
            <div><Button variant="info" onClick={loadEntityRegistry}>Load saved entity registry</Button><br/><br/></div>
          }

          <div><Button variant="primary" onClick={newEntityRegistry}>Create entity registry for {props.networkName}</Button></div>
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
