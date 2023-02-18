import { FC } from "react";

interface WalletBalancesProps {
  solBalance: number;
}

const WalletBalances: FC<WalletBalancesProps> = (
  props: WalletBalancesProps
) => {
  return (
    <p>
      Wallet Balance: <code>◎{props.solBalance}</code>
    </p>
  );
};

export default WalletBalances;
