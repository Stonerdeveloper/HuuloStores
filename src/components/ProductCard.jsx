
import React from 'react';
import { ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { id, name, price, oldPrice, image, badge, category } = product;
    const { addToCart } = useCart();
    const [isWishlisted, setIsWishlisted] = React.useState(false);

    const formatPrice = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const handleAddToCart = () => {
        addToCart(product);
        // You could replace alert with a toast here later
    };

    const toggleWishlist = () => {
        setIsWishlisted(!isWishlisted);
    };

    return (
        <div className="product-card">
            <Link to={`/product/${id}`} className="product-image-container">
                <img src={image} alt={name} className="product-image" />
                {badge && <span className="product-badge">{badge}</span>}
            </Link>
            <button
                className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                onClick={toggleWishlist}
                style={{ color: isWishlisted ? 'red' : 'inherit', fill: isWishlisted ? 'red' : 'none' }}
            >
                <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
            </button>

            <div className="product-info">
                <span className="product-category">{category}</span>
                <Link to={`/product/${id}`} className="product-title-link"> {/* Wrapped h3 in Link */}
                    <h3 className="product-title">{name}</h3>
                </Link>

                <div className="product-price-row">
                    <div className="price-container">
                        <span className="current-price">{formatPrice(price)}</span>
                        {oldPrice && <span className="old-price">{formatPrice(oldPrice)}</span>}
                    </div>
                </div>

                <button className="add-to-cart-btn" onClick={handleAddToCart}>
                    <ShoppingCart size={18} />
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
