import { FC } from "react";

interface WalletBalancesProps {
  solBalance: number;
}

const WalletBalances: FC<WalletBalancesProps> = (
  props: WalletBalancesProps
) => {
  return (
    <p className="text: bg-pink-500">
      Wallet Balance: <code>◎{props.solBalance}</code>
    </p>
  );
};

export default WalletBalances;
