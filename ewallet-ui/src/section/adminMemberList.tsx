import { Entity } from '../class/Entity'
import SpaceWidget from '../component/spaceWidget'
import BoxWidget from '../component/boxWidget'
import BoxWidgetHide from '../component/boxWidgetHide'
import DisplayMemberList from '../component/display/displayMemberList'
import AddMemberWidget from '../component/admin/addMemberWidget'

const AdminEntity = (props: {
  memberId: number,
  entity: Entity,
}) => {
  return (
    <SpaceWidget>
      <BoxWidget title='Entity member'>
        <DisplayMemberList entity={props.entity} />
      </BoxWidget>
      { props.memberId > -1 && (<>
      <BoxWidgetHide title='Add member'>
        <AddMemberWidget entity={props.entity} />
      </BoxWidgetHide>
      </>)}
    </SpaceWidget>
  )
}

export default AdminEntity
