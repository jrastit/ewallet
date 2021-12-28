type WalletType = {
  name?: string
  address: string
  pkey?: string
}

const walletListToJson = (walletList: Array<WalletType>) => {
  if (walletList)
    return JSON.stringify(walletList)
}

const walletListFromJson = (walletList: string | null): WalletType[] | undefined => {
  if (walletList)
    return JSON.parse(walletList)
}

const walletNiceName = (wallet: WalletType | undefined) => {
  if (wallet)
    return wallet.name + ' (' + wallet.address + ')'
  return ''
}

export type { WalletType }
export { walletListToJson, walletListFromJson, walletNiceName }
