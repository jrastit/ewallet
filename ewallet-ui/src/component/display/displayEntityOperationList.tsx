
import { useState, useEffect } from 'react'
import { Entity } from '../../class/Entity'
import { OperationType } from '../../type/operationType'
import DisplayBalanceWidget from '../util/displayBalanceWidget'
import {Spinner, ListGroup} from 'react-bootstrap'


const DisplayEntityOperation = (props: { entity: Entity }) => {
  const [operationList, setOperationList] = useState<Array<OperationType>>([])
  const [error, setError] = useState<string | undefined>()

  const updateOperation = (entity: Entity) => {
    entity.getOperationList().then((_operationList) => {
      if (!operationList || JSON.stringify(_operationList) !== JSON.stringify(operationList)) {
        setOperationList([..._operationList])
      }
    }).catch((_error) => {
      if (_error.message !== error) {
        setError(_error.message)
        console.error(_error)
      }
    })
  }

  useEffect(() => {
    const timer = setInterval(() => {
      updateOperation(props.entity);
    }, 2000);
    // Clear timeout if the component is unmounted
    return () => clearTimeout(timer);
  });

  const displayOperation = (operation: OperationType) => {
    return (
      <ListGroup.Item
        key={operation.blockNumber.toString()}
        variant={operation.balance[0] &&
          operation.balance[0].balance.lt(0) ? "danger" : "success"}
      > { operation.temporary && (
        <Spinner animation="border" role="status">
          <span className="sr-only">...</span>
        </Spinner>
        )}
        {operation.message}
        <DisplayBalanceWidget balance={operation.balance} entity={props.entity} />
      </ListGroup.Item>
    )
  }

  const displayOperationList = (_operationList: Array<OperationType>) => {
    const operationListToDisplay = _operationList.slice(
      Math.max(_operationList.length - 10, 0)
    ).reverse()
    return (
      <ListGroup>
        {operationListToDisplay.map((operation) => { return displayOperation(operation) })}
        {_operationList.length > 10 &&
          <ListGroup.Item key="...">...</ListGroup.Item>
        }
      </ListGroup>
    )
  }

  return (<div>
    {error ? error : displayOperationList(operationList)}
  </div>)
}

export default DisplayEntityOperation
