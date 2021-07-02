import { useState } from 'react'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { Entity } from '../../class/Entity'

const AddDeviceWidget = (props: {
  memberId: number,
  entity: Entity,
}) => {

  const [fieldValue, setFieldValue] = useState<any>({
    name: '',
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
    props.entity.addDeviceForMemberId(
      props.memberId,
      fieldValue.name,
      fieldValue.wallet,
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
        <Form.Label>Name:</Form.Label>
        <Form.Control type="text" name="name" value={fieldValue.name} onChange={handleChange} />
      </Form.Group>
      <Form.Group>
        <Form.Label>Wallet address:</Form.Label>
        <Form.Control type="text" name="wallet" value={fieldValue.wallet} onChange={handleChange} />
      </Form.Group>
      {fieldValue.name && fieldValue.wallet &&
        <Form.Group><Button variant="info" type="submit">Ok</Button></Form.Group>
      }
    </Form>
  )
  else if (submit === 1) return (
    <label>Device creation...</label>
  )
  else return (<label>Device created</label>)
}

export default AddDeviceWidget
