import { useState, useEffect } from 'react'
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import { DashLg, XLg } from 'react-bootstrap-icons';
import { Button } from 'react-bootstrap'

const BoxWidgetHide = (props: { title: string, children: any, hide?: boolean }) => {

  const [hide, setHide] = useState(false)

  useEffect(() => {
    setHide(props.hide !== undefined ? props.hide : true)
  }, [props.hide])

  return (
    <ToastContainer>
    <Toast>
      { hide &&
        <Toast.Header closeButton={false} onClick={() => setHide(false)}>
          <strong className="me-auto">{props.title}</strong>
          <Button style={{padding:0, lineHeight:'1em'}} className="btn-box" variant='default'>
            <DashLg size='1.2em' aria-label="open"/>
          </Button>
        </Toast.Header>
      }
      { !hide &&
        <>
          <Toast.Header closeButton={false} onClick={() => setHide(true)}>
            <strong className="me-auto">{props.title}</strong>
            <Button style={{padding:0, lineHeight:'1em'}} className="btn-box" variant='default'>
              <XLg size='1.2em' aria-label="open"/>
            </Button>
          </Toast.Header>
          <Toast.Body style={{ textAlign: 'center' }}>{props.children}</Toast.Body>
        </>
      }
    </Toast>
    </ToastContainer>
  )
}

export default BoxWidgetHide
