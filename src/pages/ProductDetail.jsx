
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Share2, Check } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const [selectedImage, setSelectedImage] = useState('');
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [availableGames, setAvailableGames] = useState([]);
    const [selectedGames, setSelectedGames] = useState([]);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                // Fetch current product
                const { data: productData, error: productError } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (productError) throw productError;
                setProduct(productData);
                setSelectedImage(productData.image); // Set initial main image

                // Fetch related products
                if (productData) {
                    const { data: relatedData } = await supabase
                        .from('products')
                        .select('*')
                        .eq('category', productData.category)
                        .neq('id', id)
                        .limit(4);

                    if (relatedData) setRelatedProducts(relatedData);

                    // Fetch games if it's a console
                    if (productData.category === 'Console') {
                        const { data: gamesData } = await supabase
                            .from('products')
                            .select('*')
                            .eq('category', 'Game')
                            .order('name', { ascending: true });

                        if (gamesData) setAvailableGames(gamesData);
                    }
                }
            } catch (error) {
                console.error('Error fetching product details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
        setQuantity(1);
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading...</div>;
    }

    if (!product) {
        return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Product not found.</div>;
    }

    const allImages = product.images && product.images.length > 0
        ? product.images
        : [product.image].filter(Boolean);

    const formatPrice = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const handleAddToCart = () => {
        addToCart(product, quantity, selectedGames);
        alert('Added ' + quantity + ' item(s) to cart!');
    };

    const toggleGameSelection = (game) => {
        setSelectedGames(prev => {
            const isSelected = prev.find(g => g.id === game.id);
            if (isSelected) {
                return prev.filter(g => g.id !== game.id);
            } else {
                return [...prev, game];
            }
        });
    };

    return (
        <div className="product-detail-page">
            <div className="container">
                {/* Breadcrumb */}
                <div className="breadcrumb">
                    <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <span>{product.name}</span>
                </div>

                <div className="product-layout">
                    {/* Product Image */}
                    <div className="product-gallery">
                        <div className="main-image">
                            <img src={selectedImage || product.image} alt={product.name} />
                        </div>

                        {allImages.length > 1 && (
                            <div className="thumbnails">
                                {allImages.map((imgUrl, idx) => (
                                    <div
                                        key={idx}
                                        className={`thumbnail ${selectedImage === imgUrl ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(imgUrl)}
                                    >
                                        <img src={imgUrl} alt={`thumbnail-${idx}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="product-details-info">
                        <span className="detail-category">{product.category}</span>
                        <h1 className="detail-title">{product.name}</h1>

                        <div className="detail-price-row">
                            <span className="detail-price">{formatPrice(product.price)}</span>
                            {product.old_price && <span className="detail-old-price">{formatPrice(product.old_price)}</span>}
                            {product.badge && <span className="detail-badge">{product.badge}</span>}
                        </div>

                        <p className="detail-description">
                            {product.description || `Experience the ${product.name}. Premium quality gaming gear designed to elevate your gameplay.`}
                        </p>

                        <ul className="detail-features">
                            <li><Check size={16} className="text-accent" /> Official Warranty Included</li>
                            <li><Check size={16} className="text-accent" /> Fast Delivery Nationwide</li>
                            <li><Check size={16} className="text-accent" /> 7-Day Return Policy</li>
                        </ul>

                        {product.category === 'Console' && availableGames.length > 0 && (
                            <div className="game-selection-section">
                                <h3 className="section-subtitle">Select Games to Install <span className="game-count">({selectedGames.length} selected)</span></h3>
                                <p className="section-hint">Choose games you'd like us to pre-install on your console.</p>
                                <div className="game-selection-grid">
                                    {availableGames.map(game => (
                                        <div
                                            key={game.id}
                                            className={`game-selection-card ${selectedGames.find(g => g.id === game.id) ? 'selected' : ''}`}
                                            onClick={() => toggleGameSelection(game)}
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
                            </div>
                        )}

                        <div className="detail-actions">
                            <div className="quantity-selector">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                                <span>{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)}>+</button>
                            </div>

                            <button className="add-cart-large" onClick={handleAddToCart}>
                                <ShoppingCart size={20} /> Add to Cart
                            </button>

                            <button className="icon-action-btn">
                                <Heart size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="related-section">
                        <h3 className="section-title">Related Products</h3>
                        <div className="grid shop-grid">
                            {relatedProducts.map(p => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;
