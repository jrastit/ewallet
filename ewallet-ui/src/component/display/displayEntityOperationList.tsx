
import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { entityGetOperationList } from '../../chain/entityChain'
import { EntityType, EntityOperationType } from '../../type/entityType'
import ListGroup from 'react-bootstrap/ListGroup';


const DisplayEntityOperation = (props: { entity: EntityType }) => {
  const [operationList, setOperationList] = useState<Array<EntityOperationType>>([])
  const [error, setError] = useState<string | undefined>()

  const updateOperation = (entity: EntityType) => {
    entityGetOperationList(entity).then((_operationList) => {
      if (!operationList || _operationList.length !== operationList.length) {
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

  const displayOperation = (operation: EntityOperationType) => {
    return (
      <ListGroup.Item key={operation.blockNumber.toString()} variant={operation.amount.lt(0) ? "danger" : "success"}>
        {operation.message} {ethers.utils.formatEther(operation.amount)} ETH
      </ListGroup.Item>
    )
  }

  const displayOperationList = (_operationList: Array<EntityOperationType>) => {
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
