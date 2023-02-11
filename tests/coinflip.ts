import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { publicKey } from "@project-serum/anchor/dist/cjs/utils";
import { Coinflip } from "../target/types/coinflip";
import * as utils from "../test-utils/utils";
import { PublicKey } from "@solana/web3.js";
import Keypair = anchor.web3.Keypair;
import BN = require("bn.js");
import { Connection } from "@solana/web3.js";
import * as bs58 from "bs58";

describe("coin-flip", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Coinflip as Program<Coinflip>;

  const provider = utils.getProvider();

  const myKeypair = provider.wallet.payer as anchor.web3.Keypair;

  it("Play!", async () => {
    const treasury = utils.getOurPda("escrow", provider.publicKey)[0];
    // treasury pubkey = 4oyLCtCD9i7ENVR86kQfv9WQY6tznTzFqFBhGydziNj8

    const streak = utils.getOurPda("winning_streak", provider.publicKey)[0];

    const fundResult = await utils.fundThatAddress(100, treasury);

    try {
      fundResult;
      const tx = await program.methods
        .play(0, new BN(1))
        .accounts({
          player: provider.publicKey,
          tokenVault: treasury,
          systemProgram: anchor.web3.SystemProgram.programId,
          winStreak: streak,
        })
        .signers([myKeypair])
        .rpc();
      console.log(
        "Your transaction signature",
        `https://explorer.solana.com/tx/${tx}?cluster=devnet`
      );
    } catch (err) {
      console.trace(err);
    }
  });
});
