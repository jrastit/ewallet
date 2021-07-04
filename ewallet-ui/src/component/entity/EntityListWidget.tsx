
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

  const displayEntity = (entity: Entity) => {
    console.log("entity ", entity)
    return (
      <ListGroup.Item key={entity.name} onClick={() => props.setEntity(entity)}>
        {entity.name}
      </ListGroup.Item>
    )
  }

  const displayEntityList = (_entityList: Array<Entity>) => {
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
