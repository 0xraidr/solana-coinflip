import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Head from "next/head";
import { FC, useEffect, useState } from "react";
import { getSolBalance } from "../utils/solana";
import Coinflip from "./Coinflip";
import Footer from "./Footer";
import WalletBalances from "./WalletBalances";

export const HomeView: FC = ({}) => {
  const [solBalance, setSolBalance] = useState<number>(0);
  const [refreshSol, refreshSolTrigger] = useState<boolean>(false);

  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  useEffect(() => {
    if (!publicKey) return;
    (async () => {
      try {
        let balance = await getSolBalance(connection, publicKey);
        setSolBalance(balance);
      } catch (err) {
        console.log(err);
      }
    })();
  }, [publicKey, connection, refreshSol]);

  return (
    <div>
      <Head>
        <title>Coin Flip</title>
        <meta name="description" content="BuildSpace Core 2022 Demo Project" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1>
          Welcome to <a href="">Coin Flip!</a>
        </h1>
        <p className="text-3xl text: bg-red-500 font-bold">testing...</p>
        <WalletMultiButton />

        {connected && <WalletBalances solBalance={solBalance} />}
        {connected && (
          <div>
            {solBalance >= 0.01 && (
              <Coinflip
                onWin={() => refreshSolTrigger((prevCheck) => !prevCheck)}
              />
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};
