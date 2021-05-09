import React, { useState, useEffect } from 'react'
import SelectWidget from '../selectWidget'
import { EntityType } from '../../type/entityType'
import { entityGetUserList } from '../../chain/entityChain'

const UserSelectWidget = (props:{
  name : string,
  value : string,
  onChange : (event : any) => void,
  entity : EntityType,
}) => {

  const [option, setOption] = useState<Array<{
    name:string,
    value:string,
  }>>([])

  useEffect(() => {
    if (option.length === 0){
      entityGetUserList(props.entity).then(userList =>{
        const _option = userList.map(user => {return {
          value : user.userId.toString(),
          name : user.firstName + ' ' + user.lastName,
        }})
        if (_option[0])
          props.onChange({target:{
            name : props.name,
            value : _option[0].value,
          }})
        setOption(_option)
      })
    }
  })

  return (
    <SelectWidget
      name={props.name}
      value={props.value}
      onChange={props.onChange}
      option={option}
    />
  )
}

export default UserSelectWidget
