#!/usr/bin/env -S deno run --allow-net --allow-env --allow-read --allow-write --unstable

import { AggregatorClient, BigNumber, Bundle } from "../deps.ts";
import * as env from "../src/env.ts";
import Range from "../src/helpers/Range.ts";

const client = new AggregatorClient(env.ORIGIN);

function dummyHex(length: number) {
  return `0x${
    Range(length).map((i) => (i % 100).toString().padStart(2, "0")).join("")
  }`;
}

const bundle: Bundle = {
  signature: [dummyHex(64), dummyHex(64)],
  senderPublicKeys: [[dummyHex(32), dummyHex(32), dummyHex(32), dummyHex(32)]],
  operations: [{
    nonce: BigNumber.from(0),
    actions: [{
      ethValue: BigNumber.from(0),
      contractAddress: dummyHex(20),
      encodedFunction: dummyHex(64),
    }],
  }],
};

console.log("sending", bundle);

const failures = await client.add(bundle);
if (failures.length) {
  throw new Error(failures.join(", "));
}
