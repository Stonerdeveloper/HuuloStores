
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Filter, ChevronDown } from 'lucide-react';
import './Shop.css';
import { supabase } from '../lib/supabaseClient';

const Shop = () => {
    const { category: urlCategory } = useParams();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [priceRange, setPriceRange] = useState(1000000);
    const [categories, setCategories] = useState(['All', 'Console', 'Game', 'Accessory']);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Map URL slugs to actual category names
    const categoryMap = {
        'ps5': 'PlayStation',
        'playstation': 'PlayStation',
        'xbox': 'Xbox',
        'nintendo': 'Nintendo',
        'console': 'Console',
        'game': 'Game',
        'accessory': 'Accessory'
    };

    useEffect(() => {
        const fetchMethods = async () => {
            setLoading(true);
            // Fetch Products
            const { data: prodData, error: prodError } = await supabase.from('products').select('*');
            if (prodError) {
                console.error('Error fetching products:', prodError);
            } else if (prodData) {
                setProducts(prodData);
            }

            // Fetch Categories
            const { data: catData, error: catError } = await supabase.from('categories').select('name').order('name');
            if (catError) {
                console.error('Error fetching categories:', catError);
            } else if (catData) {
                setCategories(['All', ...catData.map(c => c.name)]);
            }

            setLoading(false);
        };

        fetchMethods();
    }, []);

    // Set selected category from URL when categories are loaded
    useEffect(() => {
        if (urlCategory) {
            const mappedCategory = categoryMap[urlCategory.toLowerCase()];
            if (mappedCategory && categories.includes(mappedCategory)) {
                setSelectedCategory(mappedCategory);
            } else {
                // Try to find a case-insensitive match in categories
                const found = categories.find(c => c.toLowerCase() === urlCategory.toLowerCase());
                if (found) {
                    setSelectedCategory(found);
                }
            }
        } else {
            setSelectedCategory('All');
        }
    }, [urlCategory, categories]);

    const filteredProducts = products.filter(product => {
        const matchCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchPrice = product.price <= priceRange;
        return matchCategory && matchPrice;
    });

    if (loading) {
        return <div className="shop-page container">Loading products...</div>;
    }

    return (
        <div className="shop-page container">
            {/* Page Header */}
            <div className="shop-header">
                <h1>Shop <span className="text-accent">All Products</span></h1>
                <p>Explore our extensive collection of gaming gear.</p>
            </div>

            <div className="shop-content">
                {/* Sidebar Filters */}
                <aside className="shop-sidebar">
                    <div className="filter-section">
                        <div className="filter-header">
                            <h3>Categories</h3>
                            <ChevronDown size={16} />
                        </div>
                        <ul className="category-list">
                            {categories.map(cat => (
                                <li key={cat}>
                                    <button
                                        className={selectedCategory === cat ? 'active' : ''}
                                        onClick={() => setSelectedCategory(cat)}
                                    >
                                        {cat}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="filter-section">
                        <div className="filter-header">
                            <h3>Price Range</h3>
                            <ChevronDown size={16} />
                        </div>
                        <div className="price-slider-container">
                            <input
                                type="range"
                                min="0"
                                max="1000000"
                                step="10000"
                                value={priceRange}
                                onChange={(e) => setPriceRange(Number(e.target.value))}
                                className="price-slider"
                            />
                            <div className="price-labels">
                                <span>₦0</span>
                                <span>₦{priceRange.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Product Grid */}
                <main className="shop-main">
                    <div className="shop-controls">
                        <span>Showing {filteredProducts.length} results</span>
                        <button className="mobile-filter-btn">
                            <Filter size={18} /> Filter
                        </button>
                        <select className="sort-select">
                            <option>Sort by: Featured</option>
                            <option>Price: Low to High</option>
                            <option>Price: High to Low</option>
                        </select>
                    </div>

                    {filteredProducts.length > 0 ? (
                        <div className="grid shop-grid">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="no-results">
                            <p>No products found matching your criteria.</p>
                            <button onClick={() => { setSelectedCategory('All'); setPriceRange(1000000); }} className="clear-filter-btn">
                                Clear Filters
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Shop;
