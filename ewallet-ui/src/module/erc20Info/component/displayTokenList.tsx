
import { useState } from 'react'
import { EWalletERC20Info } from '../contract/EWalletERC20Info'
import {
  TokenType,
  tokenListToJson,
  tokenListFromJson,
} from '../type/tokenType'
import ListGroup from 'react-bootstrap/ListGroup';
import AddressWidget from '../../../component/addressWidget'


const DisplayTokenList = (props: {
  ERC20Info : EWalletERC20Info
}) => {
  const [tokenList, setTokenList] = useState<Array<TokenType>>([])
  const [error, setError] = useState<string | undefined>()
  const [version, setVersion] = useState(-1)

  const updateERC20InfoList = (ERC20Info: EWalletERC20Info) => {
    ERC20Info.getTokenList && ERC20Info.getTokenList().then((_tokenList) => {
      const _tokenListJSON = tokenListToJson(_tokenList)
      if (!tokenList || tokenListToJson(tokenList) !== _tokenListJSON) {
        setTokenList(tokenListFromJson(_tokenListJSON))
      }
    }).catch((_error) => {
      if (_error.message !== error) {
        setError(_error.message)
        console.error(_error)
      }
    })
  }

  if (props.ERC20Info.version > version){
    setVersion(props.ERC20Info.version)
    updateERC20InfoList(props.ERC20Info)
  }

  const displayToken = (token: TokenType) => {
    return (
      <ListGroup.Item key={token.name}>
        <b>{token.name}</b><br/>
        <b>{token.niceName}</b><br/>
        <b>{token.symbol}</b><br/>
        <b>{token.decimal}</b><br/>
        <AddressWidget
          address = {token.contractAddress}
          /><br/>
      </ListGroup.Item>
    )
  }

  const displayTokenList = (_tokenList: Array<TokenType>) => {
    return (
      <ListGroup>
        {_tokenList.map((token) => { return displayToken(token) })}
      </ListGroup>
    )
  }

  return (<div>
    {error ? error : displayTokenList(tokenList)}
  </div>)
}

export default DisplayTokenList
