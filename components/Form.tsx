import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useAddress, useContract, useContractWrite, Web3Button } from "@thirdweb-dev/react";
import React, { useEffect, useState } from "react";
import styles from "../styles/button.module.css";

const Form = () => {
  const [isLoading, setIsLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const URL = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000";

  const [message, setMessage] = useState<null | string | undefined>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const address = useAddress();
  const { contract } = useContract("0x706ED67BAcC54aE391d8E6459a2cEE69E728E45A");
  const { mutateAsync: mintTo } = useContractWrite(contract, "mintTo")

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case "succeeded":
          setIsSuccess(true);
          setMessage("Your payment was successfull!");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const data = await mintTo([ address, 0, "", 1  ]);
      console.info("contract call successs", data);
    } catch (err) {
      console.error("contract call failure", err);
    }

    if (!stripe || !elements) {
      return console.error("not loaded");
    }

    setIsLoading(true);

    await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: URL,
      },
    });

    setIsLoading(false);
  };

  return (
    <>
      {message ? (
        <>
          {isSuccess && (
            <><a
              href="https://testnets.opensea.io/assets/mumbai/0x706ED67BAcC54aE391d8E6459a2cEE69E728E45A/0"
              target="_blank"
              rel="noreferrer"
            >
              Check out your NFT
            </a><div className={styles.container}>
                <Web3Button
                  contractAddress="EDITION_ADDRESS"
                  action={(contract) => contract.erc1155.claim(0, 1)}
                  onSuccess={() => alert("Claimed!")}
                  onError={() => alert("Something went wrong")}
                >
                  Claim
                </Web3Button>
              </div></>
          )}
          <a href="\">Return to main page</a>
          <h1>{message}</h1>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <PaymentElement />
          <div>
            <br></br>
            <button className={styles.mainButton} disabled={isLoading || !stripe || !elements}>
              <span>{isLoading ? "Loading..." : "Pay now"}</span>
            </button>
          </div>
        </form>
      )}
    </>
  );
};

export default Form;