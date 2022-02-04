type TokenType = {
  name: string
  niceName: string
  symbol: string
  decimal: number
  contractAddress?: string
  networkName: string
}

const tokenListToJson = (tokenList: Array<TokenType>) => {
  if (tokenList)
    return JSON.stringify(tokenList)
}

const tokenListFromJson = (tokenList: string | undefined) => {
  if (tokenList)
    return JSON.parse(tokenList)
}

export type {
  TokenType,
}
export {
  tokenListToJson,
  tokenListFromJson,
}
