import { useState } from 'react'
import { EWalletMember } from '../contract/EWalletMember'
import {
  DeviceType,
  deviceListToJson,
  deviceListFromJson
} from '../type/deviceType'
import ListGroup from 'react-bootstrap/ListGroup';


const DisplayDeviceList = (props: {
  member: EWalletMember,
  version : number,
  memberId: number,
}) => {
  const [deviceList, setDeviceList] = useState<Array<DeviceType>>([])
  const [error, setError] = useState<string | undefined>()
  const [version, setVersion] = useState(-1)

  const updateDeviceList = (memberId: number, member: EWalletMember) => {
    member.getDeviceListFromMemberId(memberId).then((_deviceList) => {
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

  if (props.member.version > version){
    setVersion(props.member.version)
    updateDeviceList(props.memberId, props.member)
  }

  const displayDevice = (device: DeviceType) => {
    return (
      <ListGroup.Item key={device.walletAddress} variant={device.disable ? "danger" : "success"}>
        {device.name}<br />{device.walletAddress}
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
