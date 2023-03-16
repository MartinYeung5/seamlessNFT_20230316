import type { AppProps } from "next/app";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";
import "../styles/globals.css";
import { MagicConnector } from "@thirdweb-dev/react/evm/connectors/magic";

// This is the chain your dApp will work on.
// Change this to the chain your app is built for.
// You can also import additional chains from `@thirdweb-dev/chains` and pass them directly.
const activeChain = "mumbai";

const magicLinkConnector = new MagicConnector({
  options: {
    apiKey: process.env.NEXT_PUBLIC_MAGIC_LINK_API_KEY as string,
    rpcUrls: {
      [ChainId.Mumbai]: "https://rpc-mumbai.maticvigil.com",
    },
  },
});

// Array of wallet connectors you want to use for your dApp.
const connectors = [magicLinkConnector];

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider 
      activeChain={activeChain}
      walletConnectors={connectors}
    >
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;
