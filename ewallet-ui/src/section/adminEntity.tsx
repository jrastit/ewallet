import { Entity } from '../class/Entity'
import SpaceWidget from '../component/spaceWidget'
import BoxWidget from '../component/boxWidget'
import BoxWidgetHide from '../component/boxWidgetHide'
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
    <>
    <SpaceWidget>
      <BoxWidget>
        <SimpleButton name="Refresh entity" onClick={props.refreshEntity}/>
      </BoxWidget>
    </SpaceWidget>
    <SpaceWidget>
      <BoxWidget title={"Entity : " + props.entity.name}>
        {!!props.entity &&
          <DisplayEntityBalance
            entity={props.entity}
            version={props.entity.version}
            />
        }
      </BoxWidget>
      { props.memberId > -1 && (<>
      <BoxWidgetHide title='Fund Entity'>
        <FundEntityWidget entity={props.entity} memberId={props.memberId} />
      </BoxWidgetHide>
      <BoxWidgetHide title='Withdraw from Entity'>
        <WithdrawEntityWidget entity={props.entity} memberId={props.memberId} />
      </BoxWidgetHide>
      </>)}
    </SpaceWidget>
    </>
  )
}

export default AdminEntity
