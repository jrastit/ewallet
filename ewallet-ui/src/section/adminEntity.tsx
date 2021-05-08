import React from 'react'
import { EntityType } from '../type/entityType'
import BoxWidget from '../component/boxWidget'
import DisplayEntityBalance from '../component/display/displayEntityBalance'
import FundEntityWidget from '../component/admin/fundEntityWidget'
import WithdrawEntityWidget from '../component/admin/withdrawEntityWidget'

const AdminEntity = (props: {
  userId: number,
  entity: EntityType,
}) => {
  return (
    <div>
      <BoxWidget title={"Entity : " + props.entity.name}>
        {!!props.entity && <div><DisplayEntityBalance entity={props.entity} /></div>}
      </BoxWidget>
      <BoxWidget title='Fund Entity'>
        <FundEntityWidget entity={props.entity} userId={props.userId} />
      </BoxWidget>
      <BoxWidget title='Withdraw from Entity'>
        <WithdrawEntityWidget entity={props.entity} userId={props.userId} />
      </BoxWidget>
    </div>
  )
}

export default AdminEntity
