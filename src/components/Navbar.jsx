
import React, { useState } from 'react';
import { ShoppingCart, User, Search, Menu, X, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, signOut } = useAuth();
    const { getCartCount } = useCart();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <span className="text-accent">Huulo</span>Stores
                </Link>

                {/* Search Bar */}
                <div className="navbar-search">
                    <input type="text" placeholder="Search for games, consoles..." />
                    <button className="search-btn">
                        <Search size={20} />
                    </button>
                </div>

                {/* Desktop Nav Actions */}
                <div className="navbar-actions">
                    {user ? (
                        <>
                            <Link to="/account" className="nav-action">
                                <User size={24} />
                                <span className="nav-label">Account</span>
                            </Link>
                            <button onClick={handleSignOut} className="nav-action" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <LogOut size={24} />
                                <span className="nav-label">Logout</span>
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="nav-action">
                            <User size={24} />
                            <span className="nav-label">Login</span>
                        </Link>
                    )}

                    <Link to="/cart" className="nav-action cart-action">
                        <ShoppingCart size={24} />
                        {getCartCount() > 0 && <span className="cart-badge">{getCartCount()}</span>}
                        <span className="nav-label">Cart</span>
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu & Categories */}
            <div className={`navbar-bottom ${isMenuOpen ? 'open' : ''}`}>
                <div className="container">
                    <ul className="nav-links">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/shop">Shop</Link></li>
                        <li><Link to="/category/ps5">PlayStation 5</Link></li>
                        <li><Link to="/category/xbox">Xbox</Link></li>
                        <li><Link to="/category/nintendo">Nintendo</Link></li>
                        <li><Link to="/wholesale">Wholesale</Link></li>
                        {/* Mobile Only Auth Links could go here if needed, but actions are usually enough */}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
