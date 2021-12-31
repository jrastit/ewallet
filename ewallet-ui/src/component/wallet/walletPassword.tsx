import { useState } from 'react'
import encUTF8 from 'crypto-js/enc-utf8';
import CryptoJS from 'crypto-js';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import BoxWidget from '../../component/boxWidget'

const WalletPassword = (props : {
  passwordCheck : string | undefined | null
  setPassword : (password : string, remeber : boolean) => void
  newPassword : (password : string, passwordCheck : string, remember : boolean) => void
}) => {

  const [password1, setPassword1] = useState<string>()
  const [password2, setPassword2] = useState<string>()
  const [remember, setRemember] = useState<boolean>(false)

  const setPassword = (_password : string) => {
    const password = CryptoJS.SHA256("2fysF8Tx" + _password).toString(CryptoJS.enc.Base64)
    const passwordCheck = CryptoJS.AES.encrypt("2fysF8Tx", password).toString()
    if (CryptoJS.AES.decrypt(passwordCheck, password).toString(encUTF8) === "2fysF8Tx"){
      props.newPassword(password, passwordCheck, remember)
    } else {
      console.error("Error creating password")
    }
  }

  const updateInputPassword = (event : any) => {
    const _password = event.target.value
    if (_password){
      if (props.passwordCheck){
        const password = CryptoJS.SHA256("2fysF8Tx" + _password).toString(CryptoJS.enc.Base64)
        try {
          if (CryptoJS.AES.decrypt(props.passwordCheck, password).toString(encUTF8) === "2fysF8Tx"){
            props.setPassword(password, remember)
          }
        } catch (error) {

        }

      }
    }
  }

  return (
    <>
      { (!!props.passwordCheck) &&
        <BoxWidget title='Password for broswer wallet'>
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" placeholder="Password" name="password" onChange={updateInputPassword}/>
          <Form.Check
          checked={remember}
          type="checkbox"
          label="Remember it"
          name="remeber"
          onChange={(event) => {console.log(event.target.value); setRemember(!remember)}}
          />
        </BoxWidget>

      }
      { (!props.passwordCheck) &&
        <BoxWidget title='Set password for broswer wallet'>
          <p>Use your internet broswer cache to keep your wallet</p>
          <p>Enter Password : <input type="password" name="password1" onChange={event => {setPassword1(event.target.value)}}></input></p>
          { !!password1 &&
            <>
            <p>ReEnter Password : <input type="password" name="password2" onChange={event => {setPassword2(event.target.value)}}></input></p>
            { (password1 === password2) &&
              <Button onClick={() => {!!password1 && setPassword(password1)}}>Set password</Button>
            }
            </>
          }
        </BoxWidget>
      }
    </>
  )


}

export default WalletPassword
