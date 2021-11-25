import { Fragment, useState, useEffect } from 'react'
import BoxWidget from '../component/boxWidget'
import DisplayDeviceList from '../component/display/displayDeviceList'
import DisplayBalanceWidget from '../component/util/displayBalanceWidget'
import AddDeviceWidget from '../component/admin/addDeviceWidget'
import SetAllowanceWidget from '../component/admin/setAllowanceWidget'
import MemberSelectWidget from '../component/util/memberSelectWidget'
import { Entity } from '../class/Entity'
import { MemberType } from '../type/memberType'
import { memberToJson, memberFromJson } from '../type/memberType'

const AdminMember = (props: {
  memberId: number,
  entity: Entity,
}) => {
  const [memberId, setMemberId] = useState<{
    current: number,
    props : number
  }>({
    current: props.memberId,
    props: props.memberId
  })
  const [member, setMember] = useState<MemberType | undefined>()
  const [error, setError] = useState<string | undefined>()

  const updateMemberEvent = (event : {target : {name : string, value : string}}) => {
    const _memberId = parseInt(event.target.value)
    if (memberId.current !== _memberId){

      setMemberId({
        current : _memberId,
        props : memberId.props,
      })
      updateMember(_memberId, props.entity)
    }

  }

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
      if (memberId.props !== props.memberId){
          setMemberId({
            current: props.memberId,
            props: props.memberId
          })
          updateMember(props.memberId, props.entity)
      } else {
        updateMember(memberId.current, props.entity)
      }
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
          <BoxWidget>
            <MemberSelectWidget
              name = "select member"
              value = {memberId.current.toString()}
              entity = {props.entity}
              onChange = {updateMemberEvent}
            />
          </BoxWidget>
          <BoxWidget title={"Member : " + member.memberName}>
            Personal account :
            <DisplayBalanceWidget balance={member.balance} entity={props.entity} />
            Personal allowance :
            <DisplayBalanceWidget balance={member.allowance} entity={props.entity} />
            Role :<br/>
            {
              member.role && member.role.map((role) => {
                if (role.value){
                  return (<Fragment key={role.name}>{role.name}<br/></Fragment>)
                }
                return ""
              })
            }
          </BoxWidget>
          <BoxWidget title={"Set allowance"}>
          <SetAllowanceWidget
            entity={props.entity}
            memberId={memberId.current}
          />
          </BoxWidget>
        </div>
      }
      { member &&
      <>
        <BoxWidget title='Add device'>
          <AddDeviceWidget entity={props.entity} memberId={memberId.current} />
        </BoxWidget>
        <BoxWidget title='Device list'>
          <DisplayDeviceList entity={props.entity} memberId={memberId.current} />
        </BoxWidget>
      </>
      }

    </div>
  )
}

export default AdminMember
