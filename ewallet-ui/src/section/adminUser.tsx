import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import BoxWidget from '../component/boxWidget'
import DisplayDeviceList from '../component/display/displayDeviceList'
import AddUserWidget from '../component/admin/addUserWidget'
import AddDeviceWidget from '../component/admin/addDeviceWidget'
import { EntityType } from '../type/entityType'
import { UserType } from '../type/userType'
import { userToJson, userFromJson } from '../type/userType'
import { userGet } from '../chain/userChain'

const AdminUser = (props: {
  userId: number,
  entity: EntityType,
}) => {
  const [user, setUser] = useState<UserType | undefined>()
  const [error, setError] = useState<string | undefined>()


  const updateUser = (userId: number, entity: EntityType) => {
    userGet(userId, entity).then((_user) => {
      const _userJSON = userToJson(_user)
      if (!user || userToJson(user) !== _userJSON) {
        setUser(userFromJson(_userJSON))
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
      updateUser(props.userId, props.entity);
    }, 2000);
    // Clear timeout if the component is unmounted
    return () => clearTimeout(timer);
  });

  return (
    <div>
      {!user &&
        <span>Loading user...</span>
      }
      {user &&
        <div>
          <BoxWidget title={"User : " + user.firstName + " " + user.lastName}>
            {ethers.utils.formatEther(user.balance)}
          </BoxWidget>
        </div>
      }
      <BoxWidget title='Add device'>
        <AddDeviceWidget entity={props.entity} userId={props.userId} />
      </BoxWidget>
      <BoxWidget title='Device list'>
        <DisplayDeviceList entity={props.entity} userId={props.userId} />
      </BoxWidget>
      <BoxWidget title='Add user'>
        <AddUserWidget entity={props.entity} />
      </BoxWidget>
    </div>
  )
}

export default AdminUser
