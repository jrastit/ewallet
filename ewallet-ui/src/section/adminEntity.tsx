import { Entity } from '../class/Entity'
import BoxWidget from '../component/boxWidget'
import DisplayEntityBalance from '../component/display/displayEntityBalance'
import FundEntityWidget from '../component/admin/fundEntityWidget'
import WithdrawEntityWidget from '../component/admin/withdrawEntityWidget'
import DisplayMemberList from '../component/display/displayMemberList'
import AddMemberWidget from '../component/admin/addMemberWidget'

const AdminEntity = (props: {
  memberId: number,
  entity: Entity,
}) => {
  return (
    <div>
      <BoxWidget title={"Entity : " + props.entity.name}>
        {!!props.entity && <div><DisplayEntityBalance entity={props.entity} /></div>}
      </BoxWidget>
      <BoxWidget title='Fund Entity'>
        <FundEntityWidget entity={props.entity} memberId={props.memberId} />
      </BoxWidget>
      <BoxWidget title='Withdraw from Entity'>
        <WithdrawEntityWidget entity={props.entity} memberId={props.memberId} />
      </BoxWidget>
      <BoxWidget title='Entity member'>
        <DisplayMemberList entity={props.entity} />
      </BoxWidget>
      <BoxWidget title='Add member'>
        <AddMemberWidget entity={props.entity} />
      </BoxWidget>
    </div>
  )
}

export default AdminEntity
