import { BigNumber } from "ethers";
import * as hubbleBls from "../../deps/hubble-bls";

import type { Bundle, Signature } from "./types";

export default function isValidEmptyBundle(bundle: Bundle) {
  if (bundle.operations.length > 0) {
    return false;
  }

  const correctEmptySignature = hubbleBls.signer.aggregate([]);

  if (!signaturesEqual(bundle.signature, correctEmptySignature)) {
    return false;
  }

  return true;
}

function signaturesEqual(left: Signature, right: Signature) {
  for (const i of [0, 1]) {
    if (!BigNumber.from(left[i]).eq(BigNumber.from(right[i]))) {
      return false;
    }
  }

  return true;
}
