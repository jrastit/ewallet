import { useState, useEffect } from 'react'
import BoxWidget from '../component/boxWidget'
import DisplayDeviceList from '../component/display/displayDeviceList'
import DisplayBalanceWidget from '../component/util/displayBalanceWidget'
import AddDeviceWidget from '../component/admin/addDeviceWidget'
import { Entity } from '../class/Entity'
import { MemberType } from '../type/memberType'
import { memberToJson, memberFromJson } from '../type/memberType'

const AdminMember = (props: {
  memberId: number,
  entity: Entity,
}) => {
  const [member, setMember] = useState<MemberType | undefined>()
  const [error, setError] = useState<string | undefined>()


  const updateMember = (memberId: number, entity: Entity) => {
    entity.getMemberFromId(memberId).then((_member) => {
      const _memberJSON = memberToJson(_member)
      if (!member || memberToJson(member) !== _memberJSON) {
        setMember(memberFromJson(_memberJSON))
      }
    }).catch((_error) => {
      if (_error.message !== error) {
        setError(_error.message)
        console.error(_error)
      }
    })
  }

  useEffect(() => {
    const timer = setInterval(() => {
      updateMember(props.memberId, props.entity);
    }, 2000);
    // Clear timeout if the component is unmounted
    return () => clearTimeout(timer);
  });

  return (
    <div>
      {!member &&
        <span>Loading member...</span>
      }
      {member &&
        <div>
          <BoxWidget title={"Member : " + member.memberName}>
            Personal account :
            <DisplayBalanceWidget balance={member.balance} entity={props.entity} />
          </BoxWidget>
        </div>
      }
      <BoxWidget title='Add device'>
        <AddDeviceWidget entity={props.entity} memberId={props.memberId} />
      </BoxWidget>
      <BoxWidget title='Device list'>
        <DisplayDeviceList entity={props.entity} memberId={props.memberId} />
      </BoxWidget>

    </div>
  )
}

export default AdminMember
