import { EWalletWallet } from '../contract/EWalletWallet'
import { WalletInfo } from '../../../type/walletInfo'

import SpaceWidget from '../../../component/spaceWidget'
import BoxWidgetHide from '../../../component/boxWidgetHide'
import DisplayEntitySendToApproveList from '../component/displaySendToApproveList'
import PayWallet from '../component/payWalletWidget'
import SendWidget from '../component/sendWidget'

const WalletTransfer = (props:{
  memberId : number
  wallet : EWalletWallet
  walletInfo : WalletInfo
}) => {
  return (
    <SpaceWidget>
    { props.walletInfo.address &&
    <BoxWidgetHide title='Pay wallet'>
      <PayWallet memberId={props.memberId} wallet={props.wallet} address={props.walletInfo.address}/>
    </BoxWidgetHide>
    }
    { props.memberId > -1 &&
    <BoxWidgetHide title='Send from wallet'>
      <SendWidget memberId={props.memberId} wallet={props.wallet}/>
    </BoxWidgetHide>
    }
    <BoxWidgetHide title='Send to Approve'>
      <DisplayEntitySendToApproveList
      wallet={props.wallet}
      version={props.wallet.version}
      />
    </BoxWidgetHide>
    </SpaceWidget>
  )
}

export default WalletTransfer
