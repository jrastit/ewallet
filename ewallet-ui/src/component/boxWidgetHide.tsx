import { useState, useEffect } from 'react'
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import { ArrowBarDown } from 'react-bootstrap-icons';

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
          <button className="btn-box"><ArrowBarDown size={'1.5em'} viewBox={'0 0 16 16'} aria-label="open"/></button>
        </Toast.Header>
      }
      { !hide &&
        <>
          <Toast.Header onClick={() => setHide(true)}>
            <strong className="me-auto">{props.title}</strong>
          </Toast.Header>
          <Toast.Body style={{ textAlign: 'center' }}>{props.children}</Toast.Body>
        </>
      }
    </Toast>
    </ToastContainer>
  )
}

export default BoxWidgetHide
