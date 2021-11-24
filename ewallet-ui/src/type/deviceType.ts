type DeviceType = {
  name: string,
  walletAddress: string,
  disable: boolean,
}

const deviceListToJson = (deviceList: Array<DeviceType>) => {
  if (deviceList)
    return JSON.stringify(deviceList)
}

const deviceListFromJson = (deviceList: string | undefined) => {
  if (deviceList)
    return JSON.parse(deviceList)
}

export type { DeviceType }
export {
  deviceListToJson, deviceListFromJson,
}
