import { Entity } from '../class/Entity'
import BoxWidget from '../component/boxWidget'
import SimpleButton from '../component/util/simpleButton'
import DisplayEntityBalance from '../component/display/displayEntityBalance'
import FundEntityWidget from '../component/admin/fundEntityWidget'
import WithdrawEntityWidget from '../component/admin/withdrawEntityWidget'

const AdminEntity = (props: {
  memberId: number,
  entity: Entity,
  refreshEntity: () => void,
}) => {
  return (
    <div>
      <BoxWidget>
        <SimpleButton name="Refresh entity" onClick={props.refreshEntity}/>
      </BoxWidget>
      <BoxWidget title={"Entity : " + props.entity.name}>
        {!!props.entity && <div><DisplayEntityBalance entity={props.entity} /></div>}
      </BoxWidget>
      { props.memberId > -1 && (<>
      <BoxWidget title='Fund Entity'>
        <FundEntityWidget entity={props.entity} memberId={props.memberId} />
      </BoxWidget>
      <BoxWidget title='Withdraw from Entity'>
        <WithdrawEntityWidget entity={props.entity} memberId={props.memberId} />
      </BoxWidget>
      </>)}
    </div>
  )
}

export default AdminEntity
