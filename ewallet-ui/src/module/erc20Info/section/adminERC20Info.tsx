import {EWalletERC20Info} from "../contract/EWalletERC20Info"
import DisplayTokenList from "../component/displayTokenList"

const AdminERC20Info = (props: {
  memberId: number,
  ERC20Info: EWalletERC20Info,
}) => {
  return (
    <DisplayTokenList
      ERC20Info= {props.ERC20Info}
    />
  )
}

export default AdminERC20Info
