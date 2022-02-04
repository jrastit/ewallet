
import { useState } from 'react'
import { EWalletWallet } from '../contract/EWalletWallet'
import { OperationType } from '../type/operationType'
import DisplayBalanceWidget from './displayBalanceWidget'
import {Spinner, ListGroup} from 'react-bootstrap'

const DisplayWalletOperation = (props: {
  wallet : EWalletWallet
}) => {
  const [operationList, setOperationList] = useState<Array<OperationType>>([])
  const [error, setError] = useState<string | undefined>()
  const [version, setVersion] = useState(-1)

  const updateOperation = (wallet: EWalletWallet) => {
    wallet.getOperationList && wallet.getOperationList().then((_operationList) => {
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

  if (props.wallet.version > version){
    setVersion(props.wallet.version)
    updateOperation(props.wallet)
  }

  const displayOperation = (operation: OperationType, id: number) => {
    return (
      <ListGroup.Item
        key={id.toString()}
        variant={operation.balance[0] &&
          operation.balance[0].balance.lt(0) ? "danger" : "success"}
      > { operation.temporary && (
        <Spinner animation="border" role="status">
          <span className="sr-only">...</span>
        </Spinner>
        )}
        {operation.message}
        <DisplayBalanceWidget balance={operation.balance} wallet={props.wallet} />
      </ListGroup.Item>
    )
  }

  const displayOperationList = (_operationList: Array<OperationType>) => {
    const operationListToDisplay = _operationList.slice(
      Math.max(_operationList.length - 10, 0)
    ).reverse()
    return (
      <ListGroup>
        {operationListToDisplay.map((operation, id) => { return displayOperation(operation, id) })}
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

export default DisplayWalletOperation
