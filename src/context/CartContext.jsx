
import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext({});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        // Initial state from local storage
        const savedCart = localStorage.getItem('huulo_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        // Save to local storage whenever cart changes
        localStorage.setItem('huulo_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, quantity = 1, selectedGames = []) => {
        setCart(prevCart => {
            // Uniquely identify item based on ID AND selected games
            const gameIds = selectedGames.map(g => g.id).sort().join(',');
            const existingItem = prevCart.find(item => {
                const itemGameIds = (item.selectedGames || []).map(g => g.id).sort().join(',');
                return item.id === product.id && itemGameIds === gameIds;
            });

            if (existingItem) {
                return prevCart.map(item => {
                    const itemGameIds = (item.selectedGames || []).map(g => g.id).sort().join(',');
                    return (item.id === product.id && itemGameIds === gameIds)
                        ? { ...item, quantity: item.quantity + quantity }
                        : item;
                });
            } else {
                return [...prevCart, { ...product, quantity, selectedGames }];
            }
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, change) => {
        setCart(prevCart => {
            return prevCart.map(item => {
                if (item.id === productId) {
                    const newQty = item.quantity + change;
                    return newQty > 0 ? { ...item, quantity: newQty } : item;
                }
                return item;
            });
        });
    };

    const updateItemMetadata = (productId, metadata) => {
        setCart(prevCart => {
            return prevCart.map(item => {
                if (item.id === productId) {
                    return { ...item, ...metadata };
                }
                return item;
            });
        });
    };

    const clearCart = () => {
        setCart([]);
    };

    const getCartCount = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            updateItemMetadata,
            clearCart,
            getCartCount,
            getCartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};
