
import React from 'react';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer-container">
                <div className="footer-section">
                    <h3 className="footer-logo"><span className="text-accent">Huulo</span>Stores</h3>
                    <p className="footer-desc">
                        Your number one source for all things gaming. We're dedicated to giving you the very best of consoles, games, and accessories.
                    </p>
                    <div className="social-icons">
                        <a href="#" className="social-icon"><Facebook size={20} /></a>
                        <a href="#" className="social-icon"><Twitter size={20} /></a>
                        <a href="#" className="social-icon"><Instagram size={20} /></a>
                    </div>
                </div>

                <div className="footer-section">
                    <h4 className="footer-title">Quick Links</h4>
                    <ul className="footer-links">
                        <li><a href="/">Home</a></li>
                        <li><a href="/shop">Shop All</a></li>
                        <li><a href="/blog">Blog</a></li>
                        <li><a href="/wholesale">Wholesale</a></li>
                        <li><a href="/cart">My Cart</a></li>
                        <li><a href="/login">Login / Register</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4 className="footer-title">Categories</h4>
                    <ul className="footer-links">
                        <li><a href="/category/ps5">PlayStation 5</a></li>
                        <li><a href="/category/xbox">Xbox Series X/S</a></li>
                        <li><a href="/category/nintendo">Nintendo Switch</a></li>
                        <li><a href="/category/accessories">Accessories</a></li>
                        <li><a href="/category/games">Video Games</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4 className="footer-title">Contact Us</h4>
                    <ul className="contact-info">
                        <li>
                            <MapPin size={18} className="contact-icon" />
                            <span>Block C, Shop 13, Alaba Int'l Market, Ojo, Lagos</span>
                        </li>
                        <li>
                            <Phone size={18} className="contact-icon" />
                            <span>+234 812 345 6789</span>
                        </li>
                        <li>
                            <Mail size={18} className="contact-icon" />
                            <span>support@huulostores.com</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} HuuloStores. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
