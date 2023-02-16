import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Head from "next/head";
import { FC, useEffect, useState } from "react";
import Template from "../components/ClickTemplate";
import styles from "../styles/Home.module.css";
import { getSolBalance } from "../utils/solana";
import Coinflip from "./Coinflip";
import Footer from "./Footer";
import WalletBalances from "./WalletBalances";
import AirDropSol from "./AirDropSol";

export const HomeView: FC = ({}) => {
  const [solBalance, setSolBalance] = useState<number>(0);
  const [wlBalance, setWlBalance] = useState<number>(0);
  const [refreshSol, refreshSolTrigger] = useState<boolean>(false);
  const [refreshWl, refreshWlTrigger] = useState<boolean>(false);

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
    <div className={styles.container}>
      <Head>
        <title>Coin Flip</title>
        <meta name="description" content="BuildSpace Core 2022 Demo Project" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="">Coin Flip!</a>
        </h1>
        <WalletMultiButton
          className={styles["wallet-adapter-button-trigger"]}
        />

        {connected && (
          <WalletBalances solBalance={solBalance} wlBalance={wlBalance} />
        )}
        {connected && (
          <div className={styles.grid}>
            {solBalance < 0.01 && (
              <AirDropSol
                onComplete={() => refreshSolTrigger((prevCheck) => !prevCheck)}
              />
            )}
            {solBalance >= 0.01 && (
              <Coinflip
                onWin={() => refreshWlTrigger((prevCheck) => !prevCheck)}
              />
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};
