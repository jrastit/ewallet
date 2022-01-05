import { Entity } from '../class/Entity'
import { WalletInfo } from '../type/walletInfo'

import SpaceWidget from '../component/spaceWidget'
import BoxWidgetHide from '../component/boxWidgetHide'
import DisplayEntitySendToApproveList from '../component/display/displaySendToApproveList'
import PayEntity from '../component/transaction/payEntityWidget'
import SendWidget from '../component/transaction/sendWidget'

const EntityTransfer = (props:{
  memberId : number
  entity : Entity
  walletInfo : WalletInfo
}) => {
  return (
    <SpaceWidget>
    { props.walletInfo.address &&
    <BoxWidgetHide title='Pay entity'>
      <PayEntity memberId={props.memberId} entity={props.entity} address={props.walletInfo.address}/>
    </BoxWidgetHide>
    }
    { props.memberId > -1 &&
    <BoxWidgetHide title='Send from entity'>
      <SendWidget memberId={props.memberId} entity={props.entity}/>
    </BoxWidgetHide>
    }
    <BoxWidgetHide title='Send to Approve'>
      <DisplayEntitySendToApproveList
      entity={props.entity}
      version={props.entity.version}
      />
    </BoxWidgetHide>
    </SpaceWidget>
  )
}

export default EntityTransfer
