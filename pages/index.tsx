import { Elements } from "@stripe/react-stripe-js";
import {
  Appearance,
  loadStripe,
  StripeElementsOptions,
} from "@stripe/stripe-js";
import { ThirdwebNftMedia, useAddress, useContract, useNFT, useDisconnect } from "@thirdweb-dev/react";
import { useMagic } from "@thirdweb-dev/react/evm/connectors/magic";
import { Magic } from "magic-sdk";
import type { NextPage } from "next";
import { createContext, FC, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import Form from "../components/Form";
import { RPCError } from 'magic-sdk';
import styles from "../styles/button.module.css";

const Home: NextPage = () => {
  const connectWithMagic = useMagic();
  const [email, setEmail] = useState<string>("");
  const address = useAddress();

  const { contract } = useContract("0x706ED67BAcC54aE391d8E6459a2cEE69E728E45A", "edition");
  const { data: nft } = useNFT(contract, 0);
  const [clientSecret, setClientSecret] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [publicAddress, setPublicAddress] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [isLogOut, setLogOut] = useState(false);
  
  //const isBrowser = () => typeof window !== 'undefined';
  
  console.log("address="+ address + " isLoading =" + isLoading + " isLoggedIn ="+isLoggedIn );
  
  const disconnectWallet = () => {
    setLogOut(true);
  }

  useEffect(() => {
    // Client-side-only code
    
    try {

      const magic = new Magic('pk_live_C6FF2199FB003F9D');
      if(!isLoggedIn) {
        const magicLogin = async () => {
          console.log("login");
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

      /*
      if(isLoggedIn){
        const magicLogOut = async () => {
          console.log("logout");
          await magic.user.logout();
          setIsLoggedIn(false);
        }
        magicLogOut();
      }
      */
    }
    catch (err) {
      if (err instanceof RPCError) {
        console.log("err ="+err);
        setIsLoggedIn(false);
        setLoading(false);
      }
    }

  }, [])

  useEffect(() => {
    // Client-side-only code
    
    try {

      const magic = new Magic('pk_live_C6FF2199FB003F9D');
      if(!isLoggedIn) {
        const magicLogin = async () => {
          console.log("login");
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

      if(isLogOut){
        const magicLogOut = async () => {
          console.log("logout");
          await magic.user.logout();
          setIsLoggedIn(false);
        }
        magicLogOut();
      }
    }
    catch (err) {
      if (err instanceof RPCError) {
        console.log("err ="+err);
        setIsLoggedIn(false);
        setLoading(false);
      }
    }

  }, [address,isLogOut])


  
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


  /*
    useEffect(() => {
      if (address) {
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
    }, [address]);
  */
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
