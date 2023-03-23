import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  Connection,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Coinflip } from "./coinflip";
import { Program } from "@project-serum/anchor";
// import * as utils from "../../test-utils/utils";
import BN from "bn.js";
import { getSolBalance } from "./solana";

export async function createFlipInstructions(
  coinflipProgram: Program<Coinflip>,
  userPubkey: PublicKey,
  userFlip: 0 | 1,
  betAmount: 1 | 2
): Promise<TransactionInstruction> {
  // Below finds the address of the PDA for treasury and win streak.
  const [treasury] = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), userPubkey.toBuffer()],
    coinflipProgram.programId
  );

  const [win_streak] = PublicKey.findProgramAddressSync(
    [Buffer.from("winning_streak"), userPubkey.toBuffer()],
    coinflipProgram.programId
  );

  const connection = new Connection("https://api.devnet.solana.com");

  // (async () => {
  //   // 1e9 lamports = 10^9 lamports = 1 SOL
  //   let txhash = await connection.requestAirdrop(treasury, 1e9);
  let balance = await getSolBalance(connection, treasury);

  //   console.log(`txhash: ${txhash}`);
  console.log("Treasury Balance", balance);

  //   console.log(treasury);
  // })();

  const tx = await coinflipProgram.methods
    .play(userFlip, new BN(betAmount * LAMPORTS_PER_SOL))
    .accounts({
      player: userPubkey,
      tokenVault: treasury,
      systemProgram: SystemProgram.programId,
      winStreak: win_streak,
    })
    .instruction();

  console.log(
    "Your transaction signature",
    // this is when running locally
    // `https://explorer.solana.com/tx/${tx}?cluster=custom&custom_url=http://localhost:8899`
    // this is for devnet
    `https://explorer.solana.com/tx/${tx}?cluster=devnet`
  );
  return tx;
}
