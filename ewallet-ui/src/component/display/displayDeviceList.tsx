import { useState, useEffect } from 'react'
import { Entity } from '../../class/Entity'
import { DeviceType } from '../../type/deviceType'
import { deviceListToJson, deviceListFromJson } from '../../type/deviceType'
import ListGroup from 'react-bootstrap/ListGroup';


const DisplayDeviceList = (props: {
  entity: Entity
  userId: number
}) => {
  const [deviceList, setDeviceList] = useState<Array<DeviceType>>([])
  const [error, setError] = useState<string | undefined>()

  const updateDeviceList = (userId: number, entity: Entity) => {
    entity.getDeviceListFromUserId(userId).then((_deviceList) => {
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

  const displayDevice = (device: DeviceType) => {
    return (
      <ListGroup.Item key={device.address} variant={device.disable ? "danger" : "success"}>
        {device.name}<br />{device.address}
      </ListGroup.Item>
    )
  }

  const displayDeviceList = (_deviceList: Array<DeviceType>) => {
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
