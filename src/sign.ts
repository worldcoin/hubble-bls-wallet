import type { BigNumber } from "@ethersproject/bignumber";
import { arrayify } from "@ethersproject/bytes";
import { keccak256 } from "@ethersproject/keccak256";
import { pack as solidityPack } from "@ethersproject/solidity";

import * as hubbleBls from "../deps/hubble-bls";

export const BLS_DOMAIN = arrayify(keccak256("0xfeedbee5"));

export type TransactionData = {
  pubKey: string;
  nonce: BigNumber;
  signature: string;
  tokenRewardAmount: BigNumber;
  contractAddress: string;
  methodId: string;
  encodedParams: string;
};

export default function sign({
  blsSignerFactory,
  chainId,
  contractAddress,
  encodedFunctionData,
  tokenRewardAmount,
  nonce,
  blsPrivateKey,
}: {
  blsSignerFactory: hubbleBls.signer.BlsSignerFactory;
  chainId: number;
  contractAddress: string;
  encodedFunctionData: string;
  tokenRewardAmount: BigNumber;
  nonce: BigNumber;
  blsPrivateKey: string;
}): string {
  const encodedFunctionHash = keccak256(solidityPack(
    ["bytes"],
    [encodedFunctionData],
  ));

  const message = solidityPack(
    ["uint256", "uint256", "uint256", "address", "bytes32"],
    [
      chainId,
      nonce,
      tokenRewardAmount,
      contractAddress,
      encodedFunctionHash,
    ]
  );

  const blsSigner = blsSignerFactory.getSigner(BLS_DOMAIN, blsPrivateKey);

  return hubbleBls.mcl.dumpG1(blsSigner.sign(message));
}
