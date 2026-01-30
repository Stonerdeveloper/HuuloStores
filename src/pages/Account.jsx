
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

    // Fetch Orders with items
    useEffect(() => {
        if (user && activeTab === 'orders') {
            const fetchOrders = async () => {
                setLoadingOrders(true);
                const { data, error } = await supabase
                    .from('orders')
                    .select(`
                        *,
                        order_items (*)
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

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending': return '#F59E0B';
            case 'processing': return '#3B82F6';
            case 'delivered': return '#10B981';
            case 'completed': return 'var(--color-primary)';
            default: return 'var(--text-secondary)';
        }
    };

    return (
        <div className="account-page container">
            <div className="account-sidebar">
                <div className="user-brief">
                    <div className="user-avatar">
                        <User size={32} />
                    </div>
                    <div className="user-info">
                        <h3>{user.email?.split('@')[0]}</h3>
                        <p>{user.email}</p>
                    </div>
                </div>

                <nav className="account-nav">
                    <button
                        className={`account-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <User size={20} /> My Profile
                    </button>
                    <button
                        className={`account-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <Package size={20} /> My Orders
                    </button>
                    <button
                        className={`account-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <Settings size={20} /> Security
                    </button>
                    <div className="nav-divider"></div>
                    <button onClick={handleSignOut} className="account-nav-item logout">
                        <LogOut size={20} /> Logout
                    </button>
                </nav>
            </div>

            <div className="account-content">
                {activeTab === 'profile' && (
                    <div className="account-section">
                        <div className="welcome-banner">
                            <h1>Welcome back, <span className="text-accent">{user.email?.split('@')[0]}</span>! 👋</h1>
                            <p>Manage your orders, profile details, and account security here.</p>
                        </div>

                        <div className="account-stats">
                            <div className="stat-card">
                                <div className="stat-icon orders"><Package /></div>
                                <div className="stat-details">
                                    <span className="stat-label">Total Orders</span>
                                    <span className="stat-number">{orders.length}</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon spent"><Package /></div>
                                <div className="stat-details">
                                    <span className="stat-label">Total Spent</span>
                                    <span className="stat-number">
                                        ₦{orders.reduce((acc, curr) => acc + Number(curr.total_amount), 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="profile-details-card">
                            <h2>Personal Information</h2>
                            <div className="profile-grid">
                                <div className="form-group">
                                    <label>Account Email</label>
                                    <input type="email" value={user.email} disabled />
                                </div>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input type="text" placeholder="Add your name" />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input type="tel" placeholder="Add your phone" />
                                </div>
                                <div className="form-group">
                                    <label>Last Login</label>
                                    <input type="text" value={new Date(user.last_sign_in_at).toLocaleString()} disabled />
                                </div>
                            </div>
                            <button className="btn-primary update-btn">Update Profile</button>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="account-section">
                        <div className="section-header">
                            <div>
                                <h2>Order History</h2>
                                <p>Manage and track your recent purchases</p>
                            </div>
                            <span className="order-count">{orders.length} orders total</span>
                        </div>

                        {loadingOrders ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Loading your history...</p>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="empty-orders">
                                <Package size={64} />
                                <h3>No orders yet</h3>
                                <p>Your order history is currently empty. Start exploring our shop!</p>
                                <button className="btn-primary" onClick={() => navigate('/shop')}>Browse Products</button>
                            </div>
                        ) : (
                            <div className="orders-timeline">
                                {orders.map(order => (
                                    <div key={order.id} className="modern-order-card">
                                        <div className="order-main-info">
                                            <div className="order-id-group">
                                                <span className="label">Order Ref</span>
                                                <span className="value">#{order.id.slice(0, 8).toUpperCase()}</span>
                                            </div>
                                            <div className="order-date-group">
                                                <span className="label">Placed On</span>
                                                <span className="value">{formatDate(order.created_at)}</span>
                                            </div>
                                            <div className="order-total-group">
                                                <span className="label">Total Amount</span>
                                                <span className="value price">₦{Number(order.total_amount).toLocaleString()}</span>
                                            </div>
                                            <div className="order-status-group">
                                                <span
                                                    className="status-pill"
                                                    style={{ backgroundColor: getStatusColor(order.status) + '15', color: getStatusColor(order.status) }}
                                                >
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="order-expanded-info">
                                            <div className="order-items-scroll">
                                                {order.order_items?.map((item, idx) => (
                                                    <div key={idx} className="order-item-row">
                                                        <div className="item-img">
                                                            <img src={item.image} alt="" />
                                                        </div>
                                                        <div className="item-info">
                                                            <h4>{item.product_name}</h4>
                                                            <p>{item.quantity} x ₦{Number(item.price).toLocaleString()}</p>
                                                            {item.metadata?.selectedGames?.length > 0 && (
                                                                <div className="item-games">
                                                                    Installed: {item.metadata.selectedGames.map(g => g.name).join(', ')}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {order.shipping_address && (
                                                <div className="shipping-mini-track">
                                                    <h5>Delivery Address</h5>
                                                    <p>{order.full_name}</p>
                                                    <p>{order.shipping_address}, {order.city}, {order.state}</p>
                                                    <p>{order.phone_number}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="account-section">
                        <div className="welcome-banner" style={{ background: 'var(--color-primary)' }}>
                            <h1>Security Settings</h1>
                            <p>Manage your password and active sessions.</p>
                        </div>
                        <div className="profile-details-card">
                            <div className="form-group">
                                <label>New Password</label>
                                <input type="password" placeholder="••••••••" />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input type="password" placeholder="••••••••" />
                            </div>
                            <button className="btn-primary">Reset Password</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Account;
