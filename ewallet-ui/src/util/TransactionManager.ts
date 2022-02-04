import * as ethers from 'ethers'

interface TransactionItem {
  txu: ethers.ethers.PopulatedTransaction | ethers.providers.TransactionRequest,
  tx: ethers.ethers.providers.TransactionResponse
  result: ethers.ethers.providers.TransactionReceipt
  log?: string
}

export class TransactionManager {
  signer: ethers.Signer

  transactionList: TransactionItem[]

  constructor(signer: ethers.Signer) {
    this.signer = signer
    this.transactionList = []
  }

  async sendTx(txu: ethers.ethers.PopulatedTransaction | ethers.providers.TransactionRequest, log: string) {
    try {
      txu.gasLimit = await this.signer.estimateGas(txu)
      txu.gasPrice = await this.signer.getGasPrice()
      const tx = await this.signer.sendTransaction(txu)
      const result = await tx.wait()
      this.transactionList.push({
        txu,
        tx,
        result,
        log
      })
      return result
    } catch (e: any) {
      let message
      try {
        message = JSON.parse(e.error.body).error.message
      } catch {
        message = e.error
      }
      throw new Error(log + ' : ' + message)
    }

  }

  async sendContractTx(
    txu: ethers.providers.TransactionRequest,
    getContract: (
      contractAddress: string,
      signer: ethers.Signer,
    ) => ethers.Contract,
    log: string
  ) {
    const result = await this.sendTx(txu, log)
    return getContract(result.contractAddress, this.signer)
  }

  gasInfo(
    transactionItem: TransactionItem
  ) {
    return {
      transactionHash: transactionItem.result.transactionHash,
      log: transactionItem.log,
      gasUsed: transactionItem.result.gasUsed.toNumber(),
      gasLimit: transactionItem.tx.gasLimit.toNumber(),
      gasPrice: transactionItem.tx.gasPrice && transactionItem.tx.gasPrice.toNumber(),
    }
  }

  log(
    transactionItem: TransactionItem
  ) {
    return transactionItem.log
  }

  async getAddress() {
    return await this.signer.getAddress()
  }
}
