import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";
import { FC, useState } from "react";
import { createFlipInstructions } from "../utils/instructions";
import { generateExplorerUrl } from "../utils/solana";
import { useWorkspace } from "./WorkspaceProvider";
import Image from "next/image";
import Loading from "./Loading";

type FlipStatus = "Win" | "Lose" | null;

interface FlipCoinPops {
  onWin: () => void;
}
const Coinflip: FC<FlipCoinPops> = (props: FlipCoinPops) => {
  const [flipStatus, setFlipStatus] = useState<FlipStatus>(null);
  const [flipping, setFlipping] = useState<boolean>(false);

  const workspace = useWorkspace();
  const { connection } = useConnection();
  const walletAdapter = useWallet();

  async function flipCoin(userFlip: 0 | 1, betAmount: 1 | 2) {
    if (userFlip !== 0 && userFlip !== 1) throw new Error("Invalid Flip!");
    setFlipping(true);
    if (betAmount !== 1 && betAmount !== 2)
      throw new Error("Invalid Bet Amount!");
    setFlipping(true);
    const coinflipProgram = workspace.coinflipProgram;

    if (!coinflipProgram) throw new Error("No Program Found");
    if (!walletAdapter.publicKey || !walletAdapter)
      throw new Error("No PubKey Found");

    const transaction = new Transaction();
    let txInstructions = await createFlipInstructions(
      coinflipProgram,
      walletAdapter.publicKey,
      userFlip,
      betAmount
    );
    transaction.add(txInstructions);

    // Step 1 - Fetch Latest Blockhash

    let latestBlockhash = await connection.getLatestBlockhash("confirmed");
    console.log(
      "   ✅ - Fetched latest blockhash. Last Valid Height:",
      latestBlockhash.lastValidBlockHeight
    );

    let signature = await walletAdapter.sendTransaction(
      transaction,
      connection
    );

    let confirmation = await connection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });

    if (confirmation.value.err)
      throw new Error("Error: Could not confirm transaction");

    console.log("   ✅ - Success!", generateExplorerUrl(signature));

    const [win_streak] = PublicKey.findProgramAddressSync(
      [Buffer.from("winning_streak"), walletAdapter.publicKey.toBuffer()],
      coinflipProgram.programId
    );

    let streak_data = await coinflipProgram.account.streak.fetch(win_streak);

    const streak: number = streak_data.counter;
    //const bn: BN = new BN(streak.counter);
    console.log("Your Winning Streak", streak);

    setFlipStatus(streak > 0 ? "Win" : "Lose");
    setFlipping(false);

    if (streak > 0) {
      props.onWin();
    }
  }
  return (
    <>
      {!flipStatus && (
        <a
          href="#"
          onClick={() => {
            return false;
          }}
        >
          <h2>{!flipping ? "Flip a Coin!" : "Flip in progress"}</h2>

          {!flipping ? (
            <p>
              <button
                onClick={() => {
                  flipCoin(0, 1);
                }}
              >
                Bet 1 SOL on Heads
              </button>
              <button
                onClick={() => {
                  flipCoin(0, 2);
                }}
              >
                Bet 2 SOL on Heads
              </button>
              <button
                onClick={() => {
                  flipCoin(1, 1);
                }}
              >
                Bet 1 SOL on Tails
              </button>
              <button
                onClick={() => {
                  flipCoin(1, 2);
                }}
              >
                Bet 2 SOL on Tails
              </button>
            </p>
          ) : (
            <Loading />
          )}
        </a>
      )}
      {flipStatus && (
        <a
          href="#"
          onClick={() => {
            setFlipStatus(null);
            return false;
          }}
        >
          <h2>{flipStatus}</h2>
          <p>{flipStatus === "Win" ? "Congrats!" : "Sorry!"}</p>
          <p>click to play again</p>
        </a>
      )}
    </>
  );
};

export default Coinflip;
