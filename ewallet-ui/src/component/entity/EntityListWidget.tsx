
import { useEffect } from 'react'
import { EntityRegistry } from '../../class/EntityRegistry'
import { Entity } from '../../class/Entity'
import ListGroup from 'react-bootstrap/ListGroup';


const EntityListWidget = (props: {
  entityRegistry: EntityRegistry,
  setEntity: ((entity: Entity) => void),
}) => {
  useEffect(() => {
    const timer = setInterval(() => {
      props.entityRegistry.update()
    }, 10000);
    // Clear timeout if the component is unmounted
    return () => clearTimeout(timer);
  });

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
    {displayEntityList(props.entityRegistry.entityList)}
  </div>)
}

export default EntityListWidget
