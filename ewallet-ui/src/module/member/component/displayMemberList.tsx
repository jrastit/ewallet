
import { useState } from 'react'
import { EWalletMember } from '../contract/EWalletMember'
import {
  MemberType,
  memberListToJson,
  memberListFromJson
} from '../type/memberType'
import ListGroup from 'react-bootstrap/ListGroup';


const DisplayMemberList = (props: {
  member : EWalletMember
  version : number
}) => {
  const [memberList, setMemberList] = useState<Array<MemberType>>([])
  const [error, setError] = useState<string | undefined>()
  const [version, setVersion] = useState(-1)

  const updateMemberList = (member: EWalletMember) => {
    member.getMemberList().then((_memberList) => {
      const _memberListJSON = memberListToJson(_memberList)
      if (!memberList || memberListToJson(memberList) !== _memberListJSON) {
        setMemberList(memberListFromJson(_memberListJSON))
      }
    }).catch((_error) => {
      if (_error.message !== error) {
        setError(_error.message)
        console.error(_error)
      }
    })
  }

  if (props.member.version > version){
    setVersion(props.member.version)
    updateMemberList(props.member)
  }

  const displayMember = (member: MemberType) => {
    return (
      <ListGroup.Item key={member.memberId} variant={member.disable ? "danger" : "success"}>
        <b>{member.memberName}</b><br/>
        {
          /*
          Balance:
          <DisplayBalanceWidget
            balance={member.balance}
            entity={props.entity}
          />
          Allowance:
          <DisplayBalanceWidget
            balance={member.allowance}
            entity={props.entity}
          />
          */
        }

      </ListGroup.Item>
    )
  }

  const displayMemberList = (_memberList: Array<MemberType>) => {
    return (
      <ListGroup>
        {_memberList.map((member) => { return displayMember(member) })}
      </ListGroup>
    )
  }

  return (<div>
    {error ? error : displayMemberList(memberList)}
  </div>)
}

export default DisplayMemberList
