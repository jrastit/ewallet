import { useState } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import TokenSelectWidget from '../util/tokenSelectWidget'
import SelectWidget from '../selectWidget'
import { Entity } from '../../class/Entity'

const SendWidget = (props: {
  memberId: number,
  entity: Entity,
}) => {
  const [fieldValue, setFieldValue] = useState<any>({
    to: '',
    token: '',
    amount: '',
    reason: '',
    reference: '',
    type: '',
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
    setSubmit(1)
    if (fieldValue.type === 'validation'){
      props.entity.sendToApprove(
        props.memberId,
        fieldValue.to,
        fieldValue.amount,
        fieldValue.token,
        fieldValue.name,
        fieldValue.reason,
      ).then(() => setSubmit(2)).catch(error => setError(error.message))
    } else {
      props.entity.send(
        props.memberId,
        fieldValue.to,
        fieldValue.amount,
        fieldValue.token,
        fieldValue.name,
        fieldValue.reason,
      ).then(() => setSubmit(2)).catch(error => setError(error.message))

    }
    event.preventDefault()

  }

  if (error) return (
    <div>
      <label>{error}</label>&nbsp;&nbsp;
      <Button variant="danger" onClick={() => { setFieldValue(0); setSubmit(0); setError(undefined); props.entity.update() }}>Ok</Button>
    </div>
  )
  else if (submit === 0) return (
    <Form onSubmit={formSubmit}>
    <Form.Group>
      <Form.Label>Pay</Form.Label>
      <SelectWidget
      name="type"
      value={fieldValue.type}
      onChange={handleChange}
      option={[
        {name:'instant', value:"instant"},
        {name:'request validation', value:"validation"}
      ]}
      />
    </Form.Group>
    <Form.Group>
      <Form.Label>To</Form.Label>
      <Form.Control
        type="text"
        name="to"
        value={fieldValue.to}
        onChange={handleChange}
      />
    </Form.Group>
      <Form.Group>
        <Form.Label>Amount in</Form.Label>
        <TokenSelectWidget
          name="token"
          value={fieldValue.token}
          onChange={handleChange}
          entity={props.entity}
        />
        <Form.Control
          type="text"
          name="amount"
          value={fieldValue.amount}
          onChange={handleChange}
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>Reason</Form.Label>
        <Form.Control
          type="text"
          name="reason"
          value={fieldValue.reason}
          onChange={handleChange}
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          name="name"
          value={fieldValue.name}
          onChange={handleChange}
        />
      </Form.Group>
      {fieldValue.to && fieldValue.token && fieldValue.amount && fieldValue.name && fieldValue.reason &&
        <Form.Group><Button variant="info" type="submit">Submit</Button></Form.Group>
      }
    </Form>
  )
  else if (submit === 1) return (
    <label>Processing tranaction ...</label>
  )
  else return (<div>
    <label>Transaction validated</label>&nbsp;&nbsp;
    <Button variant="primary" onClick={() => { setFieldValue(0); setSubmit(0) }}>Ok</Button>
  </div>)
}

export default SendWidget
