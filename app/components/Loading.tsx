import { FC } from "react";
import Image from "next/image";
import CoinPile from "../public/goldcoin.jpeg";

const Loading: FC = () => {
  return <Image src={CoinPile} height={100} alt="Flipping" />;
};

export default Loading;
