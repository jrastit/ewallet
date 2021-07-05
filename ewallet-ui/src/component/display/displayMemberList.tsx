
import { useState, useEffect } from 'react'
import { Entity } from '../../class/Entity'
import { MemberType } from '../../type/memberType'
import { memberListToJson, memberListFromJson } from '../../type/memberType'
import DisplayBalanceWidget from '../util/displayBalanceWidget'
import ListGroup from 'react-bootstrap/ListGroup';


const DisplayMemberList = (props: { entity: Entity }) => {
  const [memberList, setMemberList] = useState<Array<MemberType>>([])
  const [error, setError] = useState<string | undefined>()

  const updateMemberList = (entity: Entity) => {
    entity.getMemberList().then((_memberList) => {
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

  useEffect(() => {
    const timer = setInterval(() => {
      updateMemberList(props.entity);
    }, 2000);
    // Clear timeout if the component is unmounted
    return () => clearTimeout(timer);
  });

  const displayMember = (member: MemberType) => {
    return (
      <ListGroup.Item key={member.memberId} variant={member.disable ? "danger" : "success"}>
        <b>{member.memberName}</b><br/>
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
