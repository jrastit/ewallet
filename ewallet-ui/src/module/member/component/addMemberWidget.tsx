import { useState } from 'react'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { EWalletMember } from '../contract/EWalletMember'

const AddMemberWidget = (props: {
  member: EWalletMember,
}) => {

  const [fieldValue, setFieldValue] = useState<any>({
    memberName: '',
    deviceName: '',
    wallet: '',
  })
  const [submit, setSubmit] = useState(0)
  const [error, setError] = useState<string | null>()

  const handleChange = (event: any) => {
    const fielValue_ = { ...fieldValue }
    if (fielValue_[event.target.name] !== event.target.value) {
      fielValue_[event.target.name] = event.target.value
      setFieldValue(fielValue_)
    }
  }

  const formSubmit = (event: any) => {
    props.member.addMember && props.member.addMember(
      fieldValue.wallet,
      fieldValue.memberName,
      fieldValue.deviceName,
    ).then(() => {
      setSubmit(2)
    }).catch((error) => {
      setError(error.message)
    })
    event.preventDefault()
    setSubmit(1)
  }

  if (error) return (
    <div>
      <label>{error}</label>&nbsp;&nbsp;
      <Button variant="danger" onClick={() => { setFieldValue(0); setSubmit(0); setError(null) }}>Ok</Button>
    </div>
  )
  else if (submit === 0) return (
    <Form onSubmit={formSubmit}>
      <Form.Group>
        <Form.Label>Member name:</Form.Label>
        <Form.Control type="text" name="memberName" value={fieldValue.memberName} onChange={handleChange} />
      </Form.Group>
      <Form.Group>
        <Form.Label>Device name:</Form.Label>
        <Form.Control type="text" name="deviceName" value={fieldValue.deviceName} onChange={handleChange} />
      </Form.Group>
      <Form.Group>
        <Form.Label>Wallet address:</Form.Label>
        <Form.Control type="text" name="wallet" value={fieldValue.wallet} onChange={handleChange} />
      </Form.Group>
      {fieldValue.memberName && fieldValue.deviceName && fieldValue.wallet &&
        <Form.Group><Button variant="info" type="submit">Ok</Button></Form.Group>
      }
    </Form>
  )
  else if (submit === 1) return (
    <label>Member creation...</label>
  )
  else return (<div>
    <label>Member created</label>&nbsp;&nbsp;
    <Button variant="primary" onClick={() => { setFieldValue(0); setSubmit(0) }}>Ok</Button>
  </div>)
}

export default AddMemberWidget
