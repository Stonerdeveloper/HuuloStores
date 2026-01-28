
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Share2, Check } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
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

                // Fetch related products
                if (productData) {
                    const { data: relatedData } = await supabase
                        .from('products')
                        .select('*')
                        .eq('category', productData.category)
                        .neq('id', id)
                        .limit(4);

                    if (relatedData) setRelatedProducts(relatedData);
                }
            } catch (error) {
                console.error('Error fetching product details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();

        // Reset quantity
        setQuantity(1);

        // Scroll to top
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading...</div>;
    }

    if (!product) {
        return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Product not found.</div>;
    }

    const formatPrice = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const handleAddToCart = () => {
        addToCart(product, quantity);
        alert('Added ' + quantity + ' item(s) to cart!');
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
                            <img src={product.image} alt={product.name} />
                        </div>
                        {/* Thumbnails placeholder */}
                        <div className="thumbnails">
                            {[1, 2, 3].map((item) => (
                                <div key={item} className={`thumbnail ${item === 1 ? 'active' : ''}`}>
                                    <img src={product.image} alt="thumbnail" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="product-details-info">
                        <span className="detail-category">{product.category}</span>
                        <h1 className="detail-title">{product.name}</h1>

                        <div className="detail-price-row">
                            <span className="detail-price">{formatPrice(product.price)}</span>
                            {product.oldPrice && <span className="detail-old-price">{formatPrice(product.oldPrice)}</span>}
                            {product.badge && <span className="detail-badge">{product.badge}</span>}
                        </div>

                        <p className="detail-description">
                            Elevate your gaming experience with the {product.name}. Featuring state-of-the-art technology, immersive graphics, and lightning-fast performance. This is the ultimate choice for gamers who demand the best.
                        </p>

                        <ul className="detail-features">
                            <li><Check size={16} className="text-accent" /> Official Warranty Included</li>
                            <li><Check size={16} className="text-accent" /> Fast Delivery Nationwide</li>
                            <li><Check size={16} className="text-accent" /> 7-Day Return Policy</li>
                        </ul>

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
