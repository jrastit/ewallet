import { Fragment, useState } from 'react'
import SpaceWidget from '../../../component/spaceWidget'
import BoxWidget from '../../../component/boxWidget'
import BoxWidgetHide from '../../../component/boxWidgetHide'
import DisplayDeviceList from '../component/displayDeviceList'
import AddDeviceWidget from '../component/addDeviceWidget'
import MemberSelectWidget from '../component/memberSelectWidget'
import { EWalletMember } from '../contract/EWalletMember'
import { MemberType } from '../type/memberType'
import { memberToJson, memberFromJson } from '../type/memberType'

const AdminMember = (props: {
  memberId: number,
  member: EWalletMember,
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
      updateMember(_memberId, props.member)
    }

  }

  const updateMember = (memberId: number, ewalletMember: EWalletMember) => {
    ewalletMember.getMemberFromId(memberId).then((_member) => {
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

  if (memberId.props !== props.memberId){
      setMemberId({
        current: props.memberId,
        props: props.memberId
      })
      updateMember(props.memberId, props.member)
  } else {
    updateMember(memberId.current, props.member)
  }

  return (
    <div>
      {!member &&
        <span>Loading member...</span>
      }
      {member &&
        <div>
          <SpaceWidget>
          <BoxWidget>
            <MemberSelectWidget
              name = "select member"
              value = {memberId.current.toString()}
              member = {props.member}
              onChange = {updateMemberEvent}
            />
          </BoxWidget>
          </SpaceWidget>
          <SpaceWidget>
          <BoxWidget title={"Member : " + member.memberName}>
          {
            /*
            Personal account :
            <DisplayBalanceWidget balance={member.balance} member={props.member} />
            Personal allowance :
            <DisplayBalanceWidget balance={member.allowance} member={props.member} />
            */
          }
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
          <BoxWidgetHide title={"Set allowance"}>
          {/*
          <SetAllowanceWidget
            member={props.member}
            memberId={memberId.current}
          />
          */}
          </BoxWidgetHide>
          </SpaceWidget>
        </div>
      }
      { member &&
      <SpaceWidget>
        <BoxWidgetHide title='Add device'>
          <AddDeviceWidget member={props.member} memberId={memberId.current} />
        </BoxWidgetHide>
        <BoxWidget title='Device list'>
          <DisplayDeviceList
            member={props.member}
            version={props.member.version}
            memberId={memberId.current}
            />
        </BoxWidget>
      </SpaceWidget>
      }

    </div>
  )
}

export default AdminMember
