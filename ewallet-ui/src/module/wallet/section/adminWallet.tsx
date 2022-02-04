import SpaceWidget from '../../../component/spaceWidget'
import BoxWidget from '../../../component/boxWidget'
import BoxWidgetHide from '../../../component/boxWidgetHide'
import DisplayWalletBalance from '../component/displayWalletBalance'
import FundWalletWidget from '../component/fundWalletWidget'
import WithdrawWalletWidget from '../component/withdrawWalletWidget'
import { EWalletWallet } from '../contract/EWalletWallet'

const AdminWallet = (props: {
  memberId: number,
  wallet: EWalletWallet,
}) => {
  return (
    <>
    <SpaceWidget>
      <BoxWidget>
        {!!props.wallet &&
          <DisplayWalletBalance
            wallet={props.wallet}
            version={props.wallet.version}
            />
        }
      </BoxWidget>
      { props.memberId > -1 && (<>
      <BoxWidgetHide title='Fund Entity'>
        <FundWalletWidget wallet={props.wallet} memberId={props.memberId} />
      </BoxWidgetHide>
      <BoxWidgetHide title='Withdraw from Entity'>
        <WithdrawWalletWidget wallet={props.wallet} memberId={props.memberId} />
      </BoxWidgetHide>
      </>)}
    </SpaceWidget>
    </>
  )
}

export default AdminWallet
