import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { publicKey } from "@project-serum/anchor/dist/cjs/utils";
import { CoinFlip } from "../target/types/coin_flip";
import * as utils from "../test-utils/utils";
import { PublicKey } from "@solana/web3.js";

import Keypair = anchor.web3.Keypair;

describe("coin-flip", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.CoinFlip as Program<CoinFlip>;

  const provider = utils.getProvider();

  let signer = Keypair.generate();

  // i think if i want to use the OG escrow in the programs code i can use this below. instead i just generated a new pubkey for testing.
  // const escrowPda = utils.getOurPda("escrow", signer)[0];

  let treasury = new PublicKey("4VLbHk1ttDLLghMQCdTiZqBouYwPzTUVbMEiaHkskTv6");

  it("Play!", async () => {
    // Add your test here.
    try {
      const tx = await program.methods
        .coinflip(0, 1)
        .accounts({
          player: provider.publicKey,
          tokenVault: treasury,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
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
