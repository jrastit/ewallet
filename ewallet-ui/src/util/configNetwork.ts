const configNetwork = require('../config/network.json').network

const networkName = 'kovan'

const getNetworkConfig = (networkName : string) => {
  const networkConfig = configNetwork[networkName]
  const chainId = networkConfig.chainId
  return {chainId}
}

export {
  networkName,
  getNetworkConfig,
}
