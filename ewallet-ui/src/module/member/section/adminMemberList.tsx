import { EWalletMember } from '../contract/EWalletMember'
import SpaceWidget from '../../../component/spaceWidget'
import BoxWidget from '../../../component/boxWidget'
import BoxWidgetHide from '../../../component/boxWidgetHide'
import DisplayMemberList from '../component/displayMemberList'
import AddMemberWidget from '../component/addMemberWidget'

const AdminEntity = (props: {
  memberId: number,
  member: EWalletMember,
}) => {
  return (
    <SpaceWidget>
      {props.memberId > -1 && (<>
        <BoxWidgetHide title='Add member'>
          <AddMemberWidget member={props.member} />
        </BoxWidgetHide>
      </>)}
      <BoxWidget title='Entity member'>
        <DisplayMemberList
          member={props.member}
          version={props.member.version}
        />
      </BoxWidget>
    </SpaceWidget>
  )
}

export default AdminEntity
