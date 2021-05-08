import React, { useState, useEffect } from 'react'
import { userDeviceListGet } from '../../chain/userChain'
import { EntityType } from '../../type/entityType'
import { UserDeviceType } from '../../type/userType'
import { deviceListToJson, deviceListFromJson } from '../../type/userType'
import ListGroup from 'react-bootstrap/ListGroup';


const DisplayDeviceList = (props: {
  entity: EntityType
  userId: number
}) => {
  const [deviceList, setDeviceList] = useState<Array<UserDeviceType>>([])
  const [error, setError] = useState<string | undefined>()

  const updateDeviceList = (userId: number, entity: EntityType) => {
    userDeviceListGet(userId, entity).then((_deviceList) => {
      const _deviceListJSON = deviceListToJson(_deviceList)
      if (!deviceList || deviceListToJson(deviceList) !== _deviceListJSON) {
        setDeviceList(deviceListFromJson(_deviceListJSON))
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
      updateDeviceList(props.userId, props.entity);
    }, 2000);
    // Clear timeout if the component is unmounted
    return () => clearTimeout(timer);
  });

  const displayDevice = (device: UserDeviceType) => {
    return (
      <ListGroup.Item key={device.address} variant={device.disable ? "danger" : "success"}>
        {device.name}<br />{device.address}
      </ListGroup.Item>
    )
  }

  const displayDeviceList = (_deviceList: Array<UserDeviceType>) => {
    return (
      <ListGroup>
        {_deviceList.map((device) => { return displayDevice(device) })}
      </ListGroup>
    )
  }

  return (<div>
    {error ? error : displayDeviceList(deviceList)}
  </div>)
}

export default DisplayDeviceList
