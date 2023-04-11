import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
//import { useAddress, useContract, useContractWrite, Web3Button } from "@thirdweb-dev/react";
import React, { useEffect, useState } from "react";
import styles from "../styles/button.module.css";

const Form = () => {
  const [isLoading, setIsLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const URL = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button className={styles.mainButton} disabled={isLoading || !stripe || !elements}>
        <span>{isLoading ? "Loading..." : "Pay now"}</span>
      </button>
    </form>
  );
};

export default Form;