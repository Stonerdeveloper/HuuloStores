
import React from 'react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { products, heroSlides } from '../data/dummyData';

const Home = () => {
    // Filter products for different sections
    const featuredProducts = products.filter(p => [1, 5, 2, 4].includes(p.id));
    const newArrivals = products.filter(p => [6, 2, 7, 8].includes(p.id));

    return (
        <div className="home-page">
            <Hero slides={heroSlides} />

            <section className="container" style={{ padding: '4rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Featured <span className="text-accent">Products</span></h2>
                    <a href="/shop" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>View All</a>
                </div>

                <div className="grid" style={{
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '2rem'
                }}>
                    {featuredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>

            {/* Banner Section */}
            <section style={{
                padding: '5rem 0',
                backgroundColor: 'var(--bg-sidebar)',
                borderTop: '1px solid var(--border-color)',
                borderBottom: '1px solid var(--border-color)',
                backgroundImage: 'radial-gradient(circle at top right, rgba(124, 205, 254, 0.1), transparent)',
            }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                        Wholesale <span className="text-accent">Deals</span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
                        Looking to stock your shop? Get the best prices on gaming consoles and accessories directly from HuuloStores.
                    </p>
                    <button className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                        Join Wholesale Program
                    </button>
                </div>
            </section>

            <section className="container" style={{ padding: '4rem 0' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '2rem' }}>New <span className="text-accent">Arrivals</span></h2>
                <div className="grid" style={{
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '2rem'
                }}>
                    {newArrivals.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>

            {/* Blog Section for Visibility */}
            <section className="container" style={{ padding: '4rem 0', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Latest From <span className="text-accent">Blog</span></h2>
                    <a href="/blog" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Read All</a>
                </div>
                <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-sidebar)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Stay updated with the latest gaming news, reviews, and deals.</p>
                    <a href="/blog" className="btn-primary">Visit Blog</a>
                </div>
            </section>
        </div>
    );
};

export default Home;
