import logo from './logo.svg';
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import './App.css';
import Cart from "./Cart";
import Product from "./Product";
import CartItem from "./CartItem";
import React, { useState } from 'react';
import items from "./items"

const promise = loadStripe("pk_test_ZX3S55VtZUnuBQT9S3Vdyelb");

 export default function App() {
  const [itemsInCart, setItemsInCart] = useState([]);

  const handleAddToCartClick = id => {
    setItemsInCart(itemsInCart => {
      const itemInCart = itemsInCart.find(item => item.id === id);

      // if item is already in cart, update the quantity
      if (itemInCart) {
        return itemsInCart.map(item => {
          if (item.id !== id) return item;
          return { ...itemInCart, quantity: item.quantity + 1 };
        });
      }

      // otherwise, add new item to cart
      const item = items.find(item => item.id === id);
      return [...itemsInCart, { ...item, quantity: 1 }];
    });
  };

  const totalCost = itemsInCart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="App">
      <header className="App-header">
       
        <h1 className="App-header-text">Stripe Pin Shop</h1>
      </header>
      <main className="App-shop">
        <div className="App-products">
          {items.map(item => (
            <Product
              key={item.title}
              title={item.title}
              price={item.price}
              image={item.image}
              onAddToCartClick={() => handleAddToCartClick(item.id)}
            />
          ))}
        </div>

        <Cart itemsInCart={itemsInCart} totalCost={totalCost} />
        {itemsInCart.length > 0 && (
        <Elements stripe={promise}>
          <center><CheckoutForm pr={itemsInCart}/> </center>
        </Elements>
        )}
      </main>
    </div>
  );
}

