const functions = require('firebase-functions');

const express = require('express');
const cors = require('cors');

const app = express();

const bodyParser = require('body-parser');
// Automatically allow cross-origin requests
app.use(cors({ origin: true }));


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
const stripe = require("stripe")("sk_test_AYdFHF7eJ3nwzfdwGrSbFqCf");

const endpointSecret = "whsec_ZRcI3ugiMN4lG1KsiqXpcQAP72tjnepl";

admin.initializeApp();

// Take the text parameter passed to this HTTP endpoint and insert it into 
// Cloud Firestore under the path /messages/:documentId/original
exports.addOrder = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  const  items  = req.body; 
  // Grab the text parameter.
  //const original = req.query.text;
  // Push the new message into Cloud Firestore using the Firebase Admin SDK.
  const writeResult = await admin.firestore().collection('orders').add(items);
  // Send back a message that we've succesfully written the message
  res.json({result: `Message with ID: ${writeResult.id} added.`});
});

// Listens for new messages added to /messages/:documentId/original and creates an
// uppercase version of the message to /messages/:documentId/uppercase
exports.makeUppercase = functions.firestore.document('/messages/{documentId}')
    .onCreate((snap, context) => {
      // Grab the current value of what was written to Cloud Firestore.
      const original = snap.data().original;

      // Access the parameter `{documentId}` with `context.params`
      functions.logger.log('Uppercasing', context.params.documentId, original);
      
      const uppercase = original.toUpperCase();
      
      // You must return a Promise when performing asynchronous tasks inside a Functions such as
      // writing to Cloud Firestore.
      // Setting an 'uppercase' field in Cloud Firestore document returns a Promise.
      return snap.ref.set({uppercase}, {merge: true});
    });

    exports.createPaymentIntent = functions.https.onRequest(async (req, res) => {

      res.set('Access-Control-Allow-Origin', '*');

      const  items  = req.body; //JSON.stringify(req.body);
      // Create a PaymentIntent with the order amount and currency
        // Reading amount
        let price = items.p;
        console.log(JSON.stringify(req.body));

        const paymentIntent = await stripe.paymentIntents.create({
          amount: calculateOrderAmount(price)*100,
          currency: "usd",
          metadata: {integration_check: 'accept_a_payment'},
        });
        res.send({
          clientSecret: paymentIntent.client_secret
        });
    });

    const calculateOrderAmount = pr => {
      var totalCost = 0;
      pr.forEach(element => {
        if(element.id === "1"){
          totalCost+= 50*element.quantity;
        }else if (element.id === "2"){
          totalCost+= 25*element.quantity;
        }else if (element.id === "3"){
          totalCost += (300*element.quantity);
         }
      });
      return totalCost
    }
    exports.webhook = functions.https.onRequest(async (req, res) => {
    
      res.set('Access-Control-Allow-Origin', '*');

      let event;
      try {
        event = JSON.parse(req.body);
      } catch (err) {
        console.log(`⚠️  Webhook error while parsing basic request.`, err.message);
        return res.send();
      }
        // Only verify the event if you have an endpoint secret defined.
      // Otherwise use the basic event deserialized with JSON.parse
      if (endpointSecret) {
        // Get the signature sent by Stripe
        const signature = req.headers['stripe-signature'];
        try {
          event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            endpointSecret
          );
        } catch (err) {
          console.log(`⚠️  Webhook signature verification failed.`, err.message);
          return res.send(200);
        }
      }
      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object;
          console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
          // Then define and call a method to handle the successful payment intent.
          // handlePaymentIntentSucceeded(paymentIntent);
          break;
        }
        case 'payment_method.attached': {
          const paymentMethod = event.data.object;
          // Then define and call a method to handle the successful attachment of a PaymentMethod.
          // handlePaymentMethodAttached(paymentMethod);
          break;
        }
        default:{
          // Unexpected event type
          console.log(`Unhandled event type ${event.type}.`);
        }
      }
      // Return a 200 response to acknowledge receipt of the event
      res.send();

    });


