import { EntityRegistry } from '../../class/EntityRegistry'
import { Entity } from '../../class/Entity'
import ListGroup from 'react-bootstrap/ListGroup';
import { useAppSelector } from '../../hooks'

const EntityListWidget = (props: {
  entityRegistry: EntityRegistry,
  setEntity: ((entity: Entity) => void),
}) => {

  const entityList = useAppSelector((state) => state.entityListSlice.entityList)

  const displayEntity = (entity: {name:string, address:string}) => {
    console.log("entity ", entity)
    return (
      <ListGroup.Item key={entity.address} onClick={async () => props.setEntity(await props.entityRegistry.loadEntity(entity.address))}>
        {entity.name}
      </ListGroup.Item>
    )
  }

  const displayEntityList = (_entityList: Array<{name:string, address:string}>) => {
    return (
      <ListGroup>
        {_entityList.map((entity) => { return displayEntity(entity) })}
      </ListGroup>
    )
  }

  return (<div>
    {displayEntityList(entityList)}
  </div>)
}

export default EntityListWidget
