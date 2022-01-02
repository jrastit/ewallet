import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
const BoxWidget = (props: { title?: string, children: any }) => {
  return (
    <ToastContainer>
    <Toast style={{ textAlign: 'center' }}>
      {!!props.title &&
        <Toast.Header closeButton={false}>
          <strong className="me-auto">{props.title}</strong>
        </Toast.Header>
      }
      <Toast.Body>{props.children}</Toast.Body>
    </Toast>
    </ToastContainer>
  )
}

export default BoxWidget
