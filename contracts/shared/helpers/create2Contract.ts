import * as dotenv from "dotenv";
import "@nomiclabs/hardhat-ethers";

import { ethers } from "hardhat";
import { Wallet, BigNumber, Contract, ContractFactory } from "ethers";
import deployerContract from "./deployDeployer";
import { Create2Deployer } from "../../typechain";

export default class Create2Factory {

  private constructor(
    public deployerWallet?: Wallet
  ) {}

  static create(
  ): Create2Factory {
    return new Create2Factory(
      ethers.Wallet.fromMnemonic(
        `${process.env.DEPLOYER_MNEMONIC}`,
        `m/44'/60'/0'/0/${process.env.DEPLOYER_SET_INDEX}`
      ).connect(ethers.provider)
    );
  }

  static async hasContract(address: string): Promise<boolean> {
    return ((await ethers.provider.getCode(address)) === "0x");
  }

  /**
   * 
   * @param deployerWallet EOA to deploy contract, otherwise default from env vars
   * @returns create2Deployer Contract at the expected address, deploying one if not yet deployed
   */
  async deployerContract(deployerWallet: Wallet = this.deployerWallet): Promise<Create2Deployer> {
    const Create2Deployer = await ethers.getContractFactory(
      "Create2Deployer",
      deployerWallet
    );
  
    let deployerAddress = ethers.utils.getContractAddress({
      from: deployerWallet.address,
      nonce: BigNumber.from(`${process.env.DEPLOYER_SET_INDEX}`)
    });
  
    // If deployer contract doesn't exist at expected address, deploy it there
    if (Create2Factory.hasContract(deployerAddress)) {
      await (await Create2Deployer.deploy()).deployed();
    }
  
    return Create2Deployer.attach(deployerAddress);
  }

  contractAddress(
    factory: ContractFactory,
    constructorParamsBytes: string = "0x",
    salt: BigNumber = BigNumber.from(0)
  ): string {
    let initCode = factory.bytecode + constructorParamsBytes.substr(2);
  
    return "";
  }

/**
 * 
 * @param factory factory of contract
 * @param constructorParamsBytes bytes of constructor parameters 
 * @param salt unique uint256 value
 * @returns 
 */
  async create2Contract(
    factory: ContractFactory,
    constructorParamsBytes: string = "0x",
    salt: BigNumber = BigNumber.from(0)
  ): Promise<Contract> {

    let create2Deployer = await deployerContract();

    let initCode = factory.bytecode + constructorParamsBytes.substr(2);
    const initCodeHash = ethers.utils.solidityKeccak256(
      ["bytes"],
      [initCode]
    );

    let contractAddress = ethers.utils.getCreate2Address(
      create2Deployer.address,
      "0x"+salt.toHexString().substr(2).padStart(64, "0"),
      initCodeHash
    );

    // If contract doesn't exist at expected address, deploy it there
    if ((await ethers.provider.getCode(contractAddress)) ===  "0x") {
      await (await create2Deployer.deploy(
        salt,
        initCode
      )).wait();
    }

    return factory.attach(contractAddress);
  }

}
