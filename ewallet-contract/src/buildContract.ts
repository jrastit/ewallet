import * as solc from 'solc'
import * as fs from 'fs'
import * as path from 'path';
import * as fse from 'fs-extra';

const solidityPath = 'solidity/'

const findImports = (_path: string) => {
  if (_path[0] === '@') {
    return {
      contents: fs.readFileSync(path.join('node_modules', _path)).toString()
    }
  } else {
    return {
      contents: fs.readFileSync(path.join(solidityPath, _path)).toString()
    }
  }
}

const loadContract = (_path: string) => {
  if (_path[0] === '@') {
    return {
      content: fs.readFileSync(path.join('node_modules', _path)).toString()
    }
  } else {
    return {
      content: fs.readFileSync(path.join(solidityPath, _path)).toString()
    }
  }
}

const compileInput = (input: any, outputPath: string) => {

  let output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

  let hasError = 0;

  if (output.errors) {
    for (var errorNb in output.errors) {

      if (output.errors[errorNb].type === 'Warning') {
        if (output.errors[errorNb].sourceLocation.file.startsWith("@ensdomains/ens-contracts/contracts")) {
          console.log("skip ens library warning")
        } else if (output.errors[errorNb].sourceLocation.file.startsWith("@ensdomains/buffer/contracts")) {
          console.log("skip ens buffer library warning")

          /*
          } else if (output.errors[errorNb].sourceLocation.file.startsWith("@chainlink/contracts/src/v0.7")) {
            console.log("skip chainlink library warning")
          } else if (output.errors[errorNb].sourceLocation.file.startsWith("@openzeppelin/contracts/token/ERC777/ERC777.sol")) {
            console.log("skip ERC777 library warning")
          */
        } else {
          console.log(output.errors[errorNb])
          hasError = 1;
        }
      } else {
        console.log(output.errors[errorNb])
        hasError = 1;
      }
    }
  }
  if (hasError) {
    console.log("copilation error")
    process.exit(1)
  }

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath);
  }

  for (var contract in output.contracts) {
    for (var contractName in output.contracts[contract]) {
      console.log("contract ", contractName)
      let outputfile = {
        abi: output.contracts[contract][contractName].abi,
        bytecode: output.contracts[contract][contractName].evm.bytecode.object,
        linkReferences: output.contracts[contract][contractName].evm.bytecode.linkReferences,
      }
      const contractSize = ((outputfile.bytecode.length / 2) - 1);
      const contractSizeP = Math.floor(contractSize * 100 / 24576)
      console.log(contractName +
        " compiled, size : " +
        contractSize + " <= " +
        24576 +
        " / " +
        contractSizeP +
        "%")
      if (contractSize > 24576) {
        console.error("max ethereum contract size reach")
        process.exit(1)
      }
      fs.writeFileSync(outputPath + contractName + '.json', JSON.stringify(outputfile))
    }
  }
}

const buildContractConfig = (contract: string) => {
  const config = {
    language: 'Solidity',
    sources: {},
    settings: {
      "optimizer": {
        "enabled": true,
        "runs": 10000,
      },
      outputSelection: {
        '*': {}
      }
    }
  }
  config.sources[contract + ".sol"] = loadContract(contract + ".sol")
  config.settings.outputSelection['*'][contract.slice(contract.lastIndexOf('/') + 1)] = ['evm.bytecode.object', 'abi']
  return config;
}


const main = async () => {

  const outputPath = 'compiled/'

  if (fs.existsSync(outputPath)) {
    fs.rmSync(outputPath, { recursive: true })
  }
  fs.mkdirSync(outputPath)
  compileInput(buildContractConfig("@ensdomains/ens-contracts/contracts/registry/ENS"), outputPath + "ENS/")
  compileInput(buildContractConfig("@ensdomains/ens-contracts/contracts/registry/ENSRegistry"), outputPath + "ENS/")
  compileInput(buildContractConfig("@ensdomains/ens-contracts/contracts/resolvers/Resolver"), outputPath + "ENS/")
  compileInput(buildContractConfig("@ensdomains/ens-contracts/contracts/resolvers/PublicResolver"), outputPath + "ENS/")
  compileInput(buildContractConfig("EWalletERC20InfoFactory"), outputPath)
  compileInput(buildContractConfig("EWalletERC20Info"), outputPath)
  compileInput(buildContractConfig("IEWalletDomain"), outputPath)
  compileInput(buildContractConfig("EWalletDomain"), outputPath)
  compileInput(buildContractConfig("EWalletDomainChainlink"), outputPath)

  compileInput(buildContractConfig("EWalletMember"), outputPath)
  compileInput(buildContractConfig("EWalletMemberFactory"), outputPath)
  compileInput(buildContractConfig("EWallet"), outputPath)
  compileInput(buildContractConfig("EWalletFactory"), outputPath)
  compileInput(buildContractConfig("EWalletRegistry"), outputPath)
  compileInput(buildContractConfig("EWalletToken"), outputPath)
  compileInput(buildContractConfig("ERC677"), outputPath)
  compileInput(buildContractConfig("IERC677"), outputPath)

  fs.rmSync('../ewallet-ui/src/contract/solidity/' + outputPath, { recursive: true, force: true })

  // To copy a folder or file
  fse.copySync(outputPath, '../ewallet-ui/src/contract/solidity/' + outputPath)

}

if (require.main === module) {
  try {
    main()
  } catch (err) {
    console.error(err)
  }
}
