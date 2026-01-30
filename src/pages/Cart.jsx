
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, Minus, ArrowRight, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePaystackPayment } from 'react-paystack';
import './Cart.css';

import { supabase } from '../lib/supabaseClient'; // Import supabase

const Cart = () => {
    const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart, updateItemMetadata } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Checkout Steps: 'review', 'shipping'
    const [checkoutStep, setCheckoutStep] = useState('review');
    const [shippingInfo, setShippingInfo] = useState({
        fullName: '',
        phoneNumber: '',
        address: '',
        city: '',
        state: ''
    });

    // Game Selection Modal State
    const [showGameModal, setShowGameModal] = useState(false);
    const [modalProduct, setModalProduct] = useState(null);
    const [availableGames, setAvailableGames] = useState([]);
    const [tempSelectedGames, setTempSelectedGames] = useState([]);

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
                        status: 'pending',
                        payment_reference: reference.reference,
                        full_name: shippingInfo.fullName,
                        phone_number: shippingInfo.phoneNumber,
                        shipping_address: shippingInfo.address,
                        city: shippingInfo.city,
                        state: shippingInfo.state
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
                image: item.image,
                metadata: { selectedGames: item.selectedGames || [] }
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

    const handleCheckout = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        // 1. Validate Game Selection for Consoles
        const consolesWithoutGames = cart.filter(item =>
            item.category === 'Console' && (!item.selectedGames || item.selectedGames.length === 0)
        );

        if (consolesWithoutGames.length > 0) {
            // Fetch games and open modal for the first one
            setModalProduct(consolesWithoutGames[0]);
            const { data: gamesData } = await supabase
                .from('products')
                .select('*')
                .eq('category', 'Game')
                .order('name', { ascending: true });

            if (gamesData) setAvailableGames(gamesData);
            setTempSelectedGames([]);
            setShowGameModal(true);
            return;
        }

        // 2. Move to Shipping
        setCheckoutStep('shipping');
    };

    const handleShippingSubmit = (e) => {
        e.preventDefault();
        // Simple validation
        if (!shippingInfo.fullName || !shippingInfo.phoneNumber || !shippingInfo.address) {
            alert('Please fill in all required shipping details.');
            return;
        }

        // Trigger Paystack payment
        initializePayment(onSuccess, onClose);
    };

    const saveGameSelection = () => {
        if (tempSelectedGames.length === 0) {
            if (!confirm('Proceed without selecting any games?')) return;
        }
        updateItemMetadata(modalProduct.id, { selectedGames: tempSelectedGames });
        setShowGameModal(false);
        setModalProduct(null);
    };

    const toggleGameInModal = (game) => {
        setTempSelectedGames(prev => {
            const isSelected = prev.find(g => g.id === game.id);
            if (isSelected) return prev.filter(g => g.id !== game.id);
            return [...prev, game];
        });
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

            {showGameModal && (
                <div className="game-modal-overlay">
                    <div className="game-modal">
                        <h2>Select Games for {modalProduct?.name}</h2>
                        <p>This console needs pre-installed games. Please select at least one.</p>

                        <div className="game-selection-grid">
                            {availableGames.map(game => (
                                <div
                                    key={game.id}
                                    className={`game-selection-card ${tempSelectedGames.find(g => g.id === game.id) ? 'selected' : ''}`}
                                    onClick={() => toggleGameInModal(game)}
                                >
                                    <div className="game-card-img">
                                        <img src={game.image} alt={game.name} />
                                    </div>
                                    <div className="game-card-info">
                                        <span className="game-card-name">{game.name}</span>
                                    </div>
                                    <div className="selection-indicator">
                                        <Check size={12} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowGameModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={saveGameSelection}>Save Selection</button>
                        </div>
                    </div>
                </div>
            )}

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
                                    {item.selectedGames?.length > 0 && (
                                        <div className="cart-item-games">
                                            <strong>Games to install:</strong>
                                            <ul>
                                                {item.selectedGames.map(game => (
                                                    <li key={game.id}>{game.name}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
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

                    {checkoutStep === 'shipping' && (
                        <form id="shipping-form" className="shipping-form" onSubmit={handleShippingSubmit}>
                            <h3>Shipping Details</h3>
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter full name"
                                    value={shippingInfo.fullName}
                                    onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number *</label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="Enter phone number"
                                    value={shippingInfo.phoneNumber}
                                    onChange={(e) => setShippingInfo({ ...shippingInfo, phoneNumber: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Delivery Address *</label>
                                <textarea
                                    required
                                    placeholder="Full street address, apartment, etc."
                                    value={shippingInfo.address}
                                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>City</label>
                                    <input
                                        type="text"
                                        placeholder="City"
                                        value={shippingInfo.city}
                                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>State</label>
                                    <input
                                        type="text"
                                        placeholder="State"
                                        value={shippingInfo.state}
                                        onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                                    />
                                </div>
                            </div>
                        </form>
                    )}

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

                    {checkoutStep === 'review' ? (
                        <button className="checkout-btn" onClick={handleCheckout}>
                            Proceed to Shipping <ArrowRight size={18} />
                        </button>
                    ) : (
                        <div className="checkout-actions">
                            <button className="back-btn" onClick={() => setCheckoutStep('review')}>
                                Back to Cart
                            </button>
                            <button type="submit" form="shipping-form" className="checkout-btn">
                                Complete Payment
                            </button>
                        </div>
                    )}

                    <Link to="/shop" className="continue-shopping">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Cart;
