
import { useState, useEffect } from 'react'
import { Entity } from '../../class/Entity'
import { UserType } from '../../type/userType'
import { userListToJson, userListFromJson } from '../../type/userType'
import DisplayBalanceWidget from '../util/displayBalanceWidget'
import ListGroup from 'react-bootstrap/ListGroup';


const DisplayUserList = (props: { entity: Entity }) => {
  const [userList, setUserList] = useState<Array<UserType>>([])
  const [error, setError] = useState<string | undefined>()

  const updateUserList = (entity: Entity) => {
    entity.getUserList().then((_userList) => {
      const _userListJSON = userListToJson(_userList)
      if (!userList || userListToJson(userList) !== _userListJSON) {
        setUserList(userListFromJson(_userListJSON))
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
      updateUserList(props.entity);
    }, 2000);
    // Clear timeout if the component is unmounted
    return () => clearTimeout(timer);
  });

  const displayUser = (user: UserType) => {
    return (
      <ListGroup.Item key={user.userId} variant={user.disable ? "danger" : "success"}>
        {user.userName}
        <DisplayBalanceWidget
          balance={user.balance}
          entity={props.entity}
        />
      </ListGroup.Item>
    )
  }

  const displayUserList = (_userList: Array<UserType>) => {
    return (
      <ListGroup>
        {_userList.map((user) => { return displayUser(user) })}
      </ListGroup>
    )
  }

  return (<div>
    {error ? error : displayUserList(userList)}
  </div>)
}

export default DisplayUserList
