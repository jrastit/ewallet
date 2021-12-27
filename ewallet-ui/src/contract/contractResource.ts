const getAbi = async (abiPath: string) => {
  return await (await fetch(abiPath)).text()
}

const getBin = async (binPath: string) => {
  return await (await fetch(binPath)).text()
}

export {
  getAbi,
  getBin,
}
