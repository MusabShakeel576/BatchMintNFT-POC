import { ethers } from "ethers";
import { ABI } from "./abi/ERC721";
import { FuseSDK } from "@fuseio/fusebox-web-sdk";
import dotenv from "dotenv";
import { parseEther } from "ethers/lib/utils";
import { Variables } from "@fuseio/fusebox-web-sdk/dist/src/constants/variables";
dotenv.config();

export let fuseSDK: FuseSDK;
const NFTAddress = process.env.CONTRACT_ADDRESS ?? "";
const NFTContract = new ethers.Contract(NFTAddress, ABI);
const withPaymaster = Boolean(process.env.WITH_PAYMASTER) ?? false;
const waitIntervalMs = process.env.WAIT_INTERVAL_MILLISECOND ?? "";
const useNonceSequence = Boolean(process.env.USE_NONCE_SEQUENCE) ?? false;

const bgYellow = (input: any) => '\x1b[43m' + input + '\x1b[0m';
const bgGreen = (input: any) => '\x1b[42m' + input + '\x1b[0m';

const privateKey = process.env.PRIVATE_KEY ?? "";
const publicApiKey = process.env.PUBLIC_API_KEY ?? "";
const credentials = new ethers.Wallet(privateKey);

export const init = async () => {
  fuseSDK = await FuseSDK.init(publicApiKey, credentials, { withPaymaster });
  fuseSDK.client.waitIntervalMs = Number(waitIntervalMs);
  return fuseSDK;
}

export const mint = async (to: string) => {
  const value = parseEther("0");
  const data = ethers.utils.arrayify(NFTContract.interface.encodeFunctionData("safeMint", [to]));

  const txOptions = { ...Variables.DEFAULT_TX_OPTIONS, useNonceSequence };
  const userOp = await fuseSDK.callContract(NFTAddress, value, data, txOptions);
  console.log(bgYellow(`UserOp hash: ${userOp?.userOpHash}`));

  const result = await userOp?.wait();
  console.log(bgGreen(`Transaction hash: ${result?.transactionHash}`))
};

export const getAddress = async () => {
  const address = fuseSDK.wallet.getSender();
  return address;
};
