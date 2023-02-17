import { FC } from "react";
import styles from "../styles/Home.module.css";

interface WalletBalancesProps {
  solBalance: number;
}

const WalletBalances: FC<WalletBalancesProps> = (
  props: WalletBalancesProps
) => {
  return (
    <p className={styles.description}>
      Wallet Balance: <code className={styles.code}>◎{props.solBalance}</code>
    </p>
  );
};

export default WalletBalances;
