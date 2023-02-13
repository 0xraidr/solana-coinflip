import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { publicKey } from "@project-serum/anchor/dist/cjs/utils";
import { Coinflip } from "../../target/types/coinflip";
import * as utils from "../../test-utils/utils";
import Keypair = anchor.web3.Keypair;
import BN = require("bn.js");
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";

// Configure the client to use the local cluster.
anchor.setProvider(anchor.AnchorProvider.env());

const program = anchor.workspace.Coinflip as Program<Coinflip>;

const provider = utils.getProvider();

const myKeypair = provider.wallet.payer as anchor.web3.Keypair;
export async function createFlipInstructions(
  coinflip: Program<Coinflip>,
  userPubkey: PublicKey,
  flip: 0 | 1,
  betAmount: 1 | 2
): Promise<TransactionInstruction> {
  const treasury = utils.getOurPda("escrow", provider.publicKey)[0];
  // treasury pubkey = 4oyLCtCD9i7ENVR86kQfv9WQY6tznTzFqFBhGydziNj8

  const streak = utils.getOurPda("winning_streak", provider.publicKey)[0];

  await utils.fundThatAddress(2, treasury);

  const treasuryBalanceBefore = await utils
    .getConnection()
    .getBalance(treasury);

  console.log(treasuryBalanceBefore);

  const tx = await program.methods
    .play(flip, new BN(1 | 2))
    .accounts({
      player: provider.publicKey,
      tokenVault: treasury,
      systemProgram: anchor.web3.SystemProgram.programId,
      winStreak: streak,
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
