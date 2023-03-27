import { Elements } from "@stripe/react-stripe-js";
import {
  Appearance,
  loadStripe,
  StripeElementsOptions,
} from "@stripe/stripe-js";
import { ThirdwebNftMedia, useAddress, useContract, useNFT, useDisconnect, useOwnedNFTs, useNFTs } from "@thirdweb-dev/react";
import { useMagic } from "@thirdweb-dev/react/evm/connectors/magic";
import { Magic } from "magic-sdk";
import type { NextPage } from "next";
import { createContext, FC, PropsWithChildren, useEffect, useMemo, useState } from "react";
import Form from "../components/Form";
import { RPCError } from 'magic-sdk';
import styles from "../styles/button.module.css";

let magic: Magic;
const isBrowser = () => typeof window !== 'undefined';
if (isBrowser()) {
  console.log("new Magic");
  magic = new Magic('pk_live_C6FF2199FB003F9D');
}

const Home: NextPage = () => {

  const [isClientSide, setClientSide] = useState(false);

  if (isBrowser() && (!isClientSide)) {
    console.log("setClientSide is true");
    setClientSide(true);
  }

  const connectWithMagic = useMagic();
  const [email, setEmail] = useState<string>("");
  const address = useAddress();
  const disconnect = useDisconnect();

  const { contract } = useContract("0x706ED67BAcC54aE391d8E6459a2cEE69E728E45A", "edition");
  //const { contract } = useContract("0x8db1590530669D897EFfE9978Ac9a6d67cFf4c65", "edition-drop")
  const { data: nft } = useNFT(contract, 0);
  const [clientSecret, setClientSecret] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [publicAddress, setPublicAddress] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [isLogOut, setLogOut] = useState(false);

  console.log("address=" + address + " isLoading =" + isLoading + " isLoggedIn =" + isLoggedIn);

  const { data: ownedNFTs } = useOwnedNFTs(contract,publicAddress);
  const { data: nfts, error } = useOwnedNFTs(contract, "0x6B56896998c064D6360dE947fE7706B7A91eaA67");
  console.log(nfts);

  const disconnectWallet = () => {
    setLogOut(true);
  }

  useEffect(() => {
    // Client-side-only code

    try {

      //const magic = new Magic('pk_live_C6FF2199FB003F9D');

      if (isClientSide) {
        const magicLogin = async () => {
          console.log("magicLogin");
          //const magic = new Magic('pk_live_C6FF2199FB003F9D');
          //console.log("magic");
          if (await magic.user.isLoggedIn()) {
            setIsLoggedIn(await magic.user.isLoggedIn());
            const { publicAddress } = await magic.user.getMetadata();
            if (publicAddress != null) {
              setPublicAddress(publicAddress);
            }
            console.log(isLoggedIn);
            setLoading(false);
          } else {
            setIsLoggedIn(false);
            setLoading(false);
          }
        }
        magicLogin();
      }

      if (!isLoggedIn) {
        const magicLogin = async () => {

          //const magic = new Magic('pk_live_C6FF2199FB003F9D');
          //console.log("magic");
          if (await magic.user.isLoggedIn()) {
            console.log("login");
            setIsLoggedIn(await magic.user.isLoggedIn());
            const { publicAddress } = await magic.user.getMetadata();
            if (publicAddress != null) {
              setPublicAddress(publicAddress);
            }
            console.log(isLoggedIn);
            setLoading(false);
          } else {
            setIsLoggedIn(false);
            setLoading(false);
          }
        }
        magicLogin();
      }

      if (isLogOut) {
        const magicLogOut = async () => {
          console.log("logout");
          disconnect();
          setIsLoggedIn(false);
          await magic.user.logout();
        }
        magicLogOut();
      }
    }
    catch (err) {
      if (err instanceof RPCError) {
        console.log("err =" + err);
        setIsLoggedIn(false);
        setLoading(false);
      }
    }

  }, [isClientSide, address, isLogOut])



  /*
  useEffect(() => {
    // Client-side-only code
    const magic = new Magic('pk_live_C6FF2199FB003F9D');

    // declare the data fetching function
    const magicLogin = async () => {
      console.log("magic.user =" + magic.user);
      console.log(magic.user);
      if (magic.user) {
        setIsLoggedIn(await magic.user.isLoggedIn());
        console.log("setIsLoggedIn =" + setIsLoggedIn);
        console.log(setIsLoggedIn);
        
        const { publicAddress } = await magic.user.getMetadata();
        if (publicAddress != null) {
          setPublicAddress(publicAddress);
        }
        console.log(isLoggedIn);
        setLoading(false);
      } else {
        setIsLoggedIn(false);
        setLoading(false);
      }
    }

    magicLogin();

  }, [])
  */
  const stripe = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
  );

  const appearance: Appearance = {
    theme: "night",
    labels: "above",
  };

  const options: StripeElementsOptions = {
    clientSecret,
    appearance,
  };

  useEffect(() => {
    if (publicAddress) {
      fetch("/api/stripe_intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.client_secret);
        });
    }
  }, [publicAddress]);

  return (
    <div>
      {(isLoading) ? (<>Loading...</>) : (
        isLoggedIn ? (
          <>
            <div className={styles.container}>
              <p>You are signed in as: {publicAddress}</p>
              <hr className={styles.divider} />
              <a className={styles.mainButton} onClick={() => disconnectWallet()}>
                Disconnect Wallet
              </a>
              <hr className={styles.divider} />

              <div>
                {nft?.metadata && (
                  <ThirdwebNftMedia
                    metadata={nft?.metadata}
                    style={{ width: 200, height: 200 }}
                  />
                )}
                <h2>{nft?.metadata?.name}</h2>
                <p>{nft?.metadata?.description}</p>
                <p>Price: 100$</p>
              </div>
              {ownedNFTs && ownedNFTs?.length > 0 && (
                <div>
                  {ownedNFTs.map((nft) => (
                    <div key={nft.metadata.id.toString()}>
                      <h1>{nft.metadata.name}</h1>
                      <ThirdwebNftMedia
                        metadata={nft.metadata}
                        style={{
                          width: 200,
                        }} />
                      <p>持有人是 {nft.owner}</p>
                    </div>
                  ))}
                </div>
              )}
              <p></p>
              {clientSecret && (
                <Elements options={options} stripe={stripe}>
                  <Form />
                </Elements>
              )}
            </div>
          </>
        )
          : (
            <>
              <div className={styles.container}>
                <h2 style={{ fontSize: "1.3rem" }}>Login With Email</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    connectWithMagic({ email });
                  }}
                  style={{
                    width: 500,
                    maxWidth: "90vw",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 16,
                  }}
                >
                  <input
                    type="email"
                    placeholder="Your Email Address"
                    style={{ width: "90%", marginBottom: 0 }}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.textInput}
                  />
                  <button className={styles.mainButton}>Login</button>
                </form>
              </div>
            </>
          )
      )}


    </div>
  );
};

export default Home;
