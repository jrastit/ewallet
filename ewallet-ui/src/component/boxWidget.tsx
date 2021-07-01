import Toast from 'react-bootstrap/Toast';

const BoxWidget = (props: { title?: string, children: any }) => {
  return (
    <Toast style={{ textAlign: 'center' }}>
      {!!props.title && <Toast.Header closeButton={false}>{props.title}</Toast.Header>}
      <Toast.Body>{props.children}</Toast.Body>
    </Toast>
  )
}

export default BoxWidget
