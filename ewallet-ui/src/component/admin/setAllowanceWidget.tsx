import { useState } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import TokenSelectWidget from '../util/tokenSelectWidget'
import { Entity } from '../../class/Entity'

const SetAllowanceWidget = (props: {
  entity: Entity,
  memberId: number,
}) => {

  const [fieldValue, setFieldValue] = useState<any>({
    token: '',
    amount: '',
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
    props.entity.setAllowance(
      props.memberId,
      fieldValue.amount,
      fieldValue.token,
    ).then(() => setSubmit(2)).catch(error => setError(error.message))
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
      {fieldValue.token && fieldValue.amount &&
        <Form.Group><Button variant="info" type="submit">Submit</Button></Form.Group>
      }
    </Form>
  )
  else if (submit === 1) return (
    <label>Depositing Fund ...</label>
  )
  else return (<div>
    <label>Allowance set </label>&nbsp;&nbsp;
    <Button variant="primary" onClick={() => { setFieldValue(0); setSubmit(0) }}>Ok</Button>
  </div>)
}

export default SetAllowanceWidget
