declare module "@ensdomains/ensjs" {
  import { ethers } from 'ethers'
  export default class ENS {
    constructor(obj: any): void
    name(name: String): Name
    ens: {
      address: string
    }
  };
}
