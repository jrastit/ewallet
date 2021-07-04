import { useState, useEffect, Fragment } from 'react'
import { EntityRegistry } from '../../class/EntityRegistry'
import { Entity } from '../../class/Entity'
import { ethers } from 'ethers'
import { Button } from 'react-bootstrap'
import { entityRegistryLoad, entityRegistryDelete } from '../../util/entityRegistryStorage'

const EntityListWidget = (props: {
  networkName: string,
  signer: ethers.Signer,
  address: string,
  setEntity: ((entity: Entity) => void),
  setEntityRegistry: ((entityRegistry: EntityRegistry | undefined) => void),
  entityRegistry: EntityRegistry | undefined
}) => {

  const [submit, setSubmit] = useState(0)
  const [error, setError] = useState<string | null>()

  const deleteEntityRegistry = () => {
    entityRegistryDelete(props.networkName)
    props.setEntityRegistry(undefined)
  }

  const loadEntityRegistry = () => {
    setSubmit(1)

    entityRegistryLoad(props.networkName, props.signer).then(
      _entityRegistry => {
        if (_entityRegistry) {
          props.setEntityRegistry(_entityRegistry)
          setSubmit(2)
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
    new EntityRegistry({
      networkName: props.networkName,
      signer: props.signer,
    }).init().then(_entityRegistry => {
      props.setEntityRegistry(_entityRegistry)
    }).catch((error) => {
      setError(error.message)
    })
  }

  useEffect(() => {
    //loadEntityRegistry()
  })

  if (error) return (
    <div>
      <label>{error}</label>&nbsp;&nbsp;
      <Button variant="danger" onClick={() => { setSubmit(0); setError(null) }}>Ok</Button>
    </div>
  )

  if (submit === 0) return (
    <Fragment>
      {!props.entityRegistry &&
        <Fragment>
          <div><Button variant="info" onClick={loadEntityRegistry}>Load entity registry</Button></div>
          <div><Button variant="primary" onClick={newEntityRegistry}>Create entity registry for {props.networkName}</Button></div>
        </Fragment>
      }
      {props.entityRegistry &&
        <Fragment>
          <div><Button variant="info" onClick={loadEntityRegistry}>Reload entity registry</Button></div>
          <div><Button variant="danger" onClick={deleteEntityRegistry}>Delte entity registry from cache</Button></div>
        </Fragment>

      }
    </Fragment>
  )

  else if (submit === 1) return (
    <label>Creating or loading entity...</label>
  )
  else return (<div>
    <label>Operation done</label>&nbsp;&nbsp;
    <Button variant="primary" onClick={() => { setSubmit(0) }}>Ok</Button>
  </div>)
}

export default EntityListWidget
