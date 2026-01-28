
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Package, LogOut, Settings } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Account = () => {
    const { user, signOut, loading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // Protect the route
    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    // Fetch Orders
    useEffect(() => {
        if (user && activeTab === 'orders') {
            const fetchOrders = async () => {
                setLoadingOrders(true);
                const { data, error } = await supabase
                    .from('orders')
                    .select(`
                        id,
                        created_at,
                        total_amount,
                        status,
                        order_items (product_name)
                    `)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching orders:', error);
                } else {
                    setOrders(data);
                }
                setLoadingOrders(false);
            };
            fetchOrders();
        }
    }, [user, activeTab]);

    if (loading || !user) {
        return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading account...</div>;
    }

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    return (
        <div className="account-page container">
            <div className="account-sidebar">
                <div className="user-brief">
                    <div className="user-avatar">
                        <User size={32} />
                    </div>
                    <div className="user-info">
                        <h3>My Account</h3>
                        <p>{user.email}</p>
                    </div>
                </div>

                <nav className="account-nav">
                    <button
                        className={`account-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <User size={20} /> Profile
                    </button>
                    <button
                        className={`account-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <Package size={20} /> Orders
                    </button>
                    <button
                        className={`account-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <Settings size={20} /> Settings
                    </button>
                    <button onClick={handleSignOut} className="account-nav-item logout">
                        <LogOut size={20} /> Logout
                    </button>
                </nav>
            </div>

            <div className="account-content">
                {activeTab === 'profile' && (
                    <div className="account-section">
                        <div className="welcome-banner">
                            <h1>Welcome back, {user.email?.split('@')[0]}!</h1>
                            <p>Here's what's happening with your account today.</p>
                        </div>

                        <div className="account-stats">
                            <div className="stat-box">
                                <span className="stat-label">Total Orders</span>
                                <span className="stat-number">{orders.length}</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-label">Total Spent</span>
                                <span className="stat-number">
                                    ₦{orders.reduce((acc, curr) => acc + Number(curr.total_amount), 0).toLocaleString()}
                                </span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-label">Member Status</span>
                                <span className="stat-number" style={{ color: 'var(--color-accent)', fontSize: '1.2rem' }}>Gold Tier</span>
                            </div>
                        </div>

                        <h2>Profile Details</h2>
                        <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" value={user.email} disabled style={{ background: 'var(--bg-secondary)' }} />
                            </div>
                            {/* More fields can act as placeholder for future */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input type="text" placeholder="Start typing..." />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input type="text" placeholder="Start typing..." />
                                </div>
                            </div>
                            <button className="btn-primary" style={{ marginTop: '1.5rem' }}>Save Changes</button>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="account-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ margin: 0 }}>My Orders</h2>
                            <span style={{ color: 'var(--text-secondary)' }}>{orders.length} orders found</span>
                        </div>

                        {loadingOrders ? (
                            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your history...</div>
                        ) : orders.length === 0 ? (
                            <div style={{ padding: '4rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)' }}>
                                <Package size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                <h3>No orders yet</h3>
                                <p style={{ marginBottom: '2rem' }}>Start shopping to see your orders here.</p>
                                <button className="btn-primary" onClick={() => navigate('/shop')}>Browse Shop</button>
                            </div>
                        ) : (
                            <div className="orders-list">
                                {orders.map(order => (
                                    <div key={order.id} className="order-card">
                                        <div className="order-header">
                                            <div>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Order ID</span>
                                                <span className="order-id" style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>#{order.id.slice(0, 8)}</span>
                                            </div>
                                            <span className={`status-badge status-${order.status.toLowerCase()}`}>{order.status}</span>
                                        </div>
                                        <div className="order-body">
                                            <div className="order-meta">
                                                <div className="meta-item">
                                                    <label>Date Placed</label>
                                                    <span>{formatDate(order.created_at)}</span>
                                                </div>
                                                <div className="meta-item">
                                                    <label>Total Amount</label>
                                                    <span style={{ color: 'var(--color-primary)' }}>₦{Number(order.total_amount).toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <div className="order-products">
                                                {order.order_items.map((item, idx) => (
                                                    <div key={idx} className="mini-product-chip">
                                                        {item.quantity}x {item.product_name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="account-section">
                        <h2>Account Settings</h2>
                        <p className="text-secondary">Manage your preferences and security settings.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Account;
