import { useState, useEffect } from 'react'
import BoxWidget from '../component/boxWidget'
import DisplayDeviceList from '../component/display/displayDeviceList'
import DisplayBalanceWidget from '../component/util/displayBalanceWidget'
import AddDeviceWidget from '../component/admin/addDeviceWidget'
import { Entity } from '../class/Entity'
import { UserType } from '../type/userType'
import { userToJson, userFromJson } from '../type/userType'

const AdminUser = (props: {
  userId: number,
  entity: Entity,
}) => {
  const [user, setUser] = useState<UserType | undefined>()
  const [error, setError] = useState<string | undefined>()


  const updateUser = (userId: number, entity: Entity) => {
    entity.getUserFromId(userId).then((_user) => {
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
          <BoxWidget title={"User : " + user.userName}>
            Personal account :
            <DisplayBalanceWidget balance={user.balance} entity={props.entity} />
          </BoxWidget>
        </div>
      }
      <BoxWidget title='Add device'>
        <AddDeviceWidget entity={props.entity} userId={props.userId} />
      </BoxWidget>
      <BoxWidget title='Device list'>
        <DisplayDeviceList entity={props.entity} userId={props.userId} />
      </BoxWidget>

    </div>
  )
}

export default AdminUser
