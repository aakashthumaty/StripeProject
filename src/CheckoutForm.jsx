import React, { useState, useEffect } from "react";
import axios from 'axios';
import qs from 'qs'
import BillingDetailsForm from './BillingDetailsForm'
import Row from './Row'

import {
  CardElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";


export default function CheckoutForm({pr}) {

  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [clientSecret, setClientSecret] = useState('');
  const [email, setEmail] = useState('');

  const stripe = useStripe();
  const elements = useElements();
  useEffect(() => {
  setClientSecret("will this work?");
   }, []);
  const cardStyle = {
    style: {
      base: {
        color: "#32325d",
        fontFamily: 'Arial, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#32325d"
        }
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a"
      }
    }
  };
  const handleChange = async (event) => {
    // Listen for changes in the CardElement
    // and display any errors as the customer types their card details
    setDisabled(event.empty);
    setError(event.error ? event.error.message : "");
  };


  const handleSubmit = async ev => {
      ev.preventDefault();
      setProcessing(true);

      const pls = axios({
        method: 'post',
        url: 'https://us-central1-stripe-project-b8326.cloudfunctions.net/createPaymentIntent',
        data: qs.stringify({
          p: pr
        }),
        headers: {
          //'Access-Control-Allow-Origin': 'https://us-central1-stripe-project-b8326.cloudfunctions.net',
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
          
        }
        }).then((response) => {
          console.log(response);
          console.log("response");
          console.log(response.data.clientSecret)
          setClientSecret(response.data.clientSecret);
          console.log(clientSecret);
          //hit Stripe
          continueSubmit(ev, response.data.clientSecret);

        }, (error) => {
          console.log(error);
          console.log("error");
        });

      };


      const continueSubmit = async (ev, sec) => {
        ev.preventDefault();
        const billingDetails = {
          name: ev.target.name.value,
          email: email,
          address: {
            city: ev.target.city.value,
            line1: ev.target.address.value,
            state: ev.target.state.value,
            postal_code: ev.target.zip.value
          }
        };
        const payload = await stripe.confirmCardPayment(sec, {
          receipt_email: email,
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: billingDetails
          },
        });
        
        if (payload.error) {
          setError(`Payment failed ${payload.error.message}`);
          setProcessing(false);
        } else {
          setError(null);
          setProcessing(false);
          setSucceeded(true);

          const pls = axios({
            method: 'post',
            url: 'https://us-central1-stripe-project-b8326.cloudfunctions.net/addOrder',
            data: qs.stringify({
              p: pr,
              person: billingDetails
            }),
            headers: {
              //'Access-Control-Allow-Origin': 'https://us-central1-stripe-project-b8326.cloudfunctions.net',
              'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
              
            }
            }).then((response) => {
              console.log(response);
              console.log("this is add order response");

            }, (error) => {
              console.log(error);
              console.log("error");
            });

        }
      }
  
  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <center><Row>
        <BillingDetailsForm />
      </Row>
      </center>
      <input
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email address"
      />
      <CardElement id="card-element" options={cardStyle} onChange={handleChange} />
      <button
        disabled={processing || disabled || succeeded}
        id="submit"
      >
        <span id="button-text">
          {processing ? (
            <div className="spinner" id="spinner"></div>
          ) : (
            "Pay"
          )}
        </span>
      </button>
      {/* Show any error that happens when processing the payment */}
      {error && (
        <div className="card-error" role="alert">
          {error}
        </div>
      )}
      {/* Show a success message upon completion */}
      <p className={succeeded ? "result-message" : "result-message hidden"}>
        Payment succeeded! Thank you for your pin purchase!
        Refresh the page to buy more pins!
      </p>
    </form>
  );
}