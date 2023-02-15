import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";
import { Coinflip } from "./coinflip";
import { Program } from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as utils from "../../test-utils/utils";
import BN from "bn.js";

export async function createFlipInstructions(
  coinflipProgram: Program<Coinflip>,
  userPubkey: PublicKey,
  flip: 0 | 1,
  betAmount: 1 | 2
): Promise<TransactionInstruction> {
  // Below finds the address of the PDA for treasury and win streak.
  const [treasury] = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow")],
    coinflipProgram.programId
  );

  const [win_streak] = PublicKey.findProgramAddressSync(
    [Buffer.from("winning_streak")],
    coinflipProgram.programId
  );
  // This below funds treasure addy during testing.
  await utils.fundThatAddress(2, treasury);

  const treasuryBalanceBefore = await utils
    .getConnection()
    .getBalance(treasury);

  console.log(treasuryBalanceBefore);

  const tx = await coinflipProgram.methods
    .play(flip, new BN(betAmount))
    .accounts({
      player: userPubkey,
      tokenVault: treasury,
      systemProgram: SystemProgram.programId,
      winStreak: win_streak,
    })
    .instruction();

  const treasuryBalanceAfter = await utils.getConnection().getBalance(treasury);

  console.log(treasuryBalanceAfter);
  console.log(
    "Your transaction signature",
    // this is when running locally
    // `https://explorer.solana.com/tx/${tx}?cluster=custom&custom_url=http://localhost:8899`
    // this is for devnet
    `https://explorer.solana.com/tx/${tx}?cluster=devnet`
  );

  return tx;
}
