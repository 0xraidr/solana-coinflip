import {
  Cluster,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  GetProgramAccountsFilter,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export function generateExplorerUrl(
  txId: string,
  cluster: Cluster = "devnet",
  address?: string
) {
  if (!address)
    return `https://explorer.solana.com/tx/${txId}/?cluster=${cluster}`;
  return `https://explorer.solana.com/address/${address}?cluster=devnet`;
}

export async function getSolBalance(connection: Connection, wallet: PublicKey) {
  let balance = 0;
  try {
    balance = await connection.getBalance(wallet, "confirmed");
    balance = balance / LAMPORTS_PER_SOL;
    console.log(`${wallet.toString()} balance: ${balance} SOL.`);
  } catch (e) {
    console.log(`error getting balance: `, e);
  } finally {
    return balance;
  }
}

export interface TokenAccounts {
  mintAddress: string;
  quantity: number;
}
