import * as solc from 'solc'
import * as fs from 'fs'
import * as path from 'path';
import * as fse from 'fs-extra';

interface FileTs {
  header: string[],
  import: string[],
  abi: string[],
  create: string[],
  get: string[],
}

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

const compileInput = (contractConfig: any, outputPath: string, fileTs: FileTs) => {

  if (contractConfig.outputPath) outputPath = outputPath + contractConfig.outputPath

  let output = JSON.parse(solc.compile(JSON.stringify(contractConfig.input), { import: findImports }));

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
      fileTs.import.push(
        "import json" + contractName + " from './" + (contractConfig.outputPath || "") + contractName + '.json' + "'")
      fileTs.abi.push(
        "export const getAbi" + contractName + " = () => {\n" +
        "\treturn json" + contractName + ".abi\n" +
        "}\n")
      if (contractSize > 0) {
        if (!contractConfig.arg) {
          contractConfig.arg = []
        }
        fileTs.create.push(
          "export const createContract" + contractName + " = async (\n" +
          contractConfig.arg.map((arg: { name: string, type: string }) => {
            return "\t" + arg.name + " : " + arg.type + ",\n"
          }).join("") +
          "\tsigner: ethers.Signer\n" +
          ") => {\n" +
          "\tconst factory = new ethers.ContractFactory(\n" +
          "\t\tjson" + contractName + ".abi,\n" +
          "\t\tjson" + contractName + ".bytecode,\n" +
          "\t\tsigner\n" +
          "\t)\n" +
          "\tconst contract = await factory.deploy(\n" +
          contractConfig.arg.map((arg: { name: string, type: string }) => {
            return "\t\t" + arg.name + (arg.type === "ethers.Contract" ? ".address" : "") + ",\n"
          }).join("") +
          "\t)\n" +
          "\tawait contract.deployed()\n" +
          "\treturn contract\n" +
          "}\n")
      }
      fileTs.get.push(
        "export const getContract" + contractName + " = (\n" +
        "\tcontractAddress: string,\n" +
        "\tsigner: ethers.Signer,\n" +
        ") => {\n" +
        "\treturn new ethers.Contract(\n" +
        "\t\tcontractAddress,\n" +
        "\t\tjson" + contractName + ".abi,\n" +
        "\t\tsigner,\n" +
        "\t)\n" +
        "}\n")
    }
  }
}

const buildContractConfig = (contractConfig: { contract: string, input?: any }) => {
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
  config.sources[contractConfig.contract + ".sol"] = loadContract(contractConfig.contract + ".sol")
  config.settings.outputSelection['*'][contractConfig.contract.slice(contractConfig.contract.lastIndexOf('/') + 1)] = ['evm.bytecode.object', 'abi']
  contractConfig.input = config
  return contractConfig;
}


const main = async () => {

  const fileTs = {
    header: ["import { ethers } from 'ethers'"],
    import: [],
    abi: [],
    create: [],
    get: [],
  }

  const outputPath = 'compiled/'

  if (fs.existsSync(outputPath)) {
    fs.rmSync(outputPath, { recursive: true })
  }
  fs.mkdirSync(outputPath)
  const defineSource = {
    file: [
      { contract: "EWalletChainlinkAggregator" },
      { contract: "EWalletERC20InfoFactory" },
      {
        contract: "EWalletERC20Info",
        arg: [
          {
            name: "ensAddress",
            type: "string"
          }]
      },
      { contract: "IEWalletDomain" },
      {
        contract: "EWalletDomain",
        arg: [
          {
            name: "oracle",
            type: "string"
          }
        ]
      },
      {
        contract: "EWalletDomainChainlink",
        arg: [
          {
            name: "linkAddress",
            type: "string"
          }, {
            name: "oracle",
            type: "string"
          }, {
            name: "jobId",
            type: "string"
          }
        ]
      },
      {
        contract: "EWalletMember",
        arg: [
          {
            name: "memberName",
            type: "string"
          }, {
            name: "deviceName",
            type: "string"
          }
        ]
      },
      { contract: "EWalletMemberFactory" },
      {
        contract: "EWallet",
        arg: [
          {
            name: "name",
            type: 'string'
          }, {
            name: "memberContract",
            type: "ethers.Contract"
          }
        ]
      },
      {
        contract: "EWalletFactory",
        arg: [
          {
            name: "memberFactoryContract",
            type: "ethers.Contract"
          }
        ]
      },
      {
        contract: "EWalletRegistry",
        arg: [
          {
            name: "eWalletFactoryContract",
            type: "ethers.Contract"
          }
        ]
      },
      {
        contract: "EWalletToken",
        arg: [
          {
            name: "name",
            type: "string"
          }, {
            name: "symbol",
            type: "string"
          }, {
            name: "initialSupply",
            type: "ethers.BigNumber"
          }, {
            name: "defaultOperators",
            type: "string[]"
          }
        ]
      },
      {
        contract: "ERC677",
        arg: [
          {
            name: "initialAccount",
            type: "string"
          }, {
            name: "initialBalance",
            type: "ethers.BigNumber"
          }, {
            name: "tokenName",
            type: "string"
          }, {
            name: "tokenSymbol",
            type: "string"
          }
        ]
      },
      { contract: "IERC677" },
      {
        contract: "@ensdomains/ens-contracts/contracts/registry/ENS",
        outputPath: "ENS/"
      }, {
        contract: "@ensdomains/ens-contracts/contracts/registry/ENSRegistry",
        outputPath: "ENS/"
      },
      {
        contract: "@ensdomains/ens-contracts/contracts/resolvers/Resolver",
        outputPath: "ENS/"
      },
      {
        contract: "@ensdomains/ens-contracts/contracts/resolvers/PublicResolver",
        arg: [
          {
            name: "registry",
            type: "string"
          },
          {
            name: "wrapperAddress",
            type: "string"
          }
        ],
        outputPath: "ENS/"
      },
    ]
  }
  defineSource.file.forEach((contractConfig: { contract: string, config?: any }) => {
    compileInput(buildContractConfig(contractConfig), outputPath, fileTs)
  })

  const fileTsOutput =
    fileTs.header.map((str: string) => str).join('\n') + "\n\n" +
    fileTs.import.map((str: string) => str).join('\n') + "\n\n" +
    //fileTs.abi.map((str: string) => str).join('\n') + "\n\n" +
    fileTs.create.map((str: string) => str).join('\n') + "\n\n" +
    fileTs.get.map((str: string) => str).join('\n') + "\n\n"

  fs.writeFileSync(outputPath + "contractAutoFactory.ts", fileTsOutput)

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
