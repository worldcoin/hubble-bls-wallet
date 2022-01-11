import { BigNumber } from "ethers";
import { signer } from "@thehubbleproject/bls";

import encodeMessageForSigning from "./encodeMessageForSigning";
import { Bundle } from "./types";

export default (domain: Uint8Array, chainId: number) =>
  (bundle: Bundle): boolean => {
    const verifier = new signer.BlsVerifier(domain);

    return verifier.verifyMultiple(
      [
        BigNumber.from(bundle.signature[0]).toHexString(),
        BigNumber.from(bundle.signature[1]).toHexString(),
      ],
      bundle.senderPublicKeys.map(([n0, n1, n2, n3]) => [
        BigNumber.from(n0).toHexString(),
        BigNumber.from(n1).toHexString(),
        BigNumber.from(n2).toHexString(),
        BigNumber.from(n3).toHexString(),
      ]),
      bundle.operations.map(encodeMessageForSigning(chainId)),
    );
  };
