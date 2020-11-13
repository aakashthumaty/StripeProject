import React from 'react';
import CartItem from './CartItem';
import './App.css';

export default function Cart({ itemsInCart, totalCost }) {
  return (
    <div className="Cart">
      <h2 className="Cart-title">Cart</h2>
      {itemsInCart.length ? (
        <div>
          {itemsInCart.map(item => (
            <CartItem
              key={item.id}
              title={item.title}
              cost={item.price * item.quantity}
              quantity={item.quantity}
            />
          ))}
          <div className="Cart-total-cost">
            Total cost: ${totalCost.toFixed(2)}
          </div>
        </div>
      ) : (
        <div>There are 0 items in your cart :(.</div>
      )}
    </div>
  );
}