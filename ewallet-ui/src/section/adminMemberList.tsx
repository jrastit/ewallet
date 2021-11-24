import { Entity } from '../class/Entity'
import BoxWidget from '../component/boxWidget'
import DisplayMemberList from '../component/display/displayMemberList'
import AddMemberWidget from '../component/admin/addMemberWidget'

const AdminEntity = (props: {
  memberId: number,
  entity: Entity,
}) => {
  return (
    <div>
      <BoxWidget title='Entity member'>
        <DisplayMemberList entity={props.entity} />
      </BoxWidget>
      { props.memberId > -1 && (<>
      <BoxWidget title='Add member'>
        <AddMemberWidget entity={props.entity} />
      </BoxWidget>
      </>)}
    </div>
  )
}

export default AdminEntity
