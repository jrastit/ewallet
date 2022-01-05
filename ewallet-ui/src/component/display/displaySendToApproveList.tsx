
import { useState } from 'react'
import { Entity } from '../../class/Entity'
import { SendToApproveType } from '../../type/sendToApproveType'
import DisplayBalanceWidget from '../util/displayBalanceWidget'
import {ListGroup} from 'react-bootstrap'


const DisplayEntitySendToApprove = (props: {
  entity : Entity
  version : number
}) => {
  const [sendToApproveList, setSendToApproveList] = useState<Array<SendToApproveType>>([])
  const [error, setError] = useState<string | undefined>()
  const [version, setVersion] = useState(-1)

  const updateSendToApprove = (entity: Entity) => {
    entity.getSendToApproveList().then((_sendToApproveList) => {
      if (!sendToApproveList || JSON.stringify(_sendToApproveList) !== JSON.stringify(sendToApproveList)) {
        setSendToApproveList([..._sendToApproveList])
      }
    }).catch((_error) => {
      if (_error.message !== error) {
        setError(_error.message)
        console.error(_error)
      }
    })
  }

  if (props.entity.version > version){
    setVersion(props.entity.version)
    updateSendToApprove(props.entity)
  }


  const displaySendToApprove = (sendToApprove: SendToApproveType) => {
    return (
      <ListGroup.Item
        key={sendToApprove.id.toString()}
        variant={!sendToApprove.validator ? "danger" : "success"}
      > {sendToApprove.name + " : " + sendToApprove.reason}
        <DisplayBalanceWidget balance={[{token : sendToApprove.tokenName, balance:sendToApprove.value}]} entity={props.entity} />
      </ListGroup.Item>
    )
  }

  const displaySendToApproveList = (_sendToApproveList: Array<SendToApproveType>) => {
    const sendToApproveListToDisplay = _sendToApproveList.slice(
      Math.max(_sendToApproveList.length - 10, 0)
    ).reverse()
    return (
      <ListGroup>
        {sendToApproveListToDisplay.map((sendToApprove) => { return displaySendToApprove(sendToApprove) })}
        {_sendToApproveList.length > 10 &&
          <ListGroup.Item key="...">...</ListGroup.Item>
        }
      </ListGroup>
    )
  }

  return (<div>
    {error ? error : displaySendToApproveList(sendToApproveList)}
  </div>)
}

export default DisplayEntitySendToApprove
