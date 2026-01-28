
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePaystackPayment } from 'react-paystack';
import './Cart.css';

import { supabase } from '../lib/supabaseClient'; // Import supabase

const Cart = () => {
    const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const subtotal = getCartTotal();
    const shipping = subtotal > 1000000 ? 0 : 5000;
    const total = subtotal + shipping;

    // Retrieve the public key from environment variables
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

    // Prepare Paystack configuration
    const config = {
        reference: (new Date()).getTime().toString(),
        email: user?.email,
        amount: total * 100, // Paystack works in kobo
        publicKey: publicKey,
    };

    const handleSaveOrder = async (reference) => {
        try {
            // 1. Create Order
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert([
                    {
                        user_id: user.id,
                        total_amount: total,
                        status: 'paid', // Assuming success from Paystack means paid
                        payment_reference: reference.reference
                    }
                ])
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create Order Items
            const orderItems = cart.map(item => ({
                order_id: orderData.id,
                product_id: item.id,
                product_name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            alert('Payment Successful! Order #' + orderData.id + ' created.');
            clearCart();
            navigate('/account');

        } catch (error) {
            console.error('Error saving order:', error);
            alert('Payment succeeded but failed to save order. Please contact support with ref: ' + reference.reference);
        }
    };

    // Initialize the Paystack payment hook
    const initializePayment = usePaystackPayment(config);

    const onSuccess = (reference) => {
        console.log("Transaction reference:", reference);
        handleSaveOrder(reference);
    };

    const onClose = () => {
        // Implementation for what happens when the user closes the transaction modal
        console.log('Payment closed');
        alert('Payment cancelled.');
    };

    const formatPrice = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const handleCheckout = () => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Trigger Paystack payment
        initializePayment(onSuccess, onClose);
    };

    if (cart.length === 0) {
        return (
            <div className="container empty-cart">
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added anything to your cart yet.</p>
                <Link to="/shop" className="btn-primary" style={{ padding: '0.75rem 1.5rem', background: 'var(--color-primary)', color: 'white', borderRadius: 'var(--radius-md)' }}>
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="cart-page container">
            <h1>Shopping <span className="text-accent">Cart</span></h1>

            <div className="cart-content">
                <div className="cart-items">
                    <div className="cart-header">
                        <span>Product</span>
                        <span>Price</span>
                        <span>Quantity</span>
                        <span>Total</span>
                        <span></span>
                    </div>

                    {cart.map(item => (
                        <div key={item.id} className="cart-item">
                            <div className="cart-product-info">
                                <img src={item.image} alt={item.name} />
                                <div>
                                    <h3>{item.name}</h3>
                                    <span className="cart-item-cat">{item.category}</span>
                                </div>
                            </div>

                            <div className="cart-price">{formatPrice(item.price)}</div>

                            <div className="cart-quantity">
                                <button onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button>
                                <span>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button>
                            </div>

                            <div className="cart-item-total">{formatPrice(item.price * item.quantity)}</div>

                            <button className="cart-remove" onClick={() => removeFromCart(item.id)}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="cart-summary">
                    <h2>Order Summary</h2>
                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="summary-row">
                        <span>Shipping</span>
                        <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                    </div>
                    <div className="summary-divider"></div>
                    <div className="summary-row total">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                    </div>

                    <button className="checkout-btn" onClick={handleCheckout}>
                        Proceed to Checkout <ArrowRight size={18} />
                    </button>

                    <Link to="/shop" className="continue-shopping">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Cart;
