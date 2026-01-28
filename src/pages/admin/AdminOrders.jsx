
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Eye, CheckCircle, XCircle, Truck } from 'lucide-react';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select(`
            *,
            profiles:user_id (email)
        `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
        } else {
            setOrders(data);
        }
        setLoading(false);
    };

    const updateStatus = async (id, newStatus) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            alert('Error updating status');
        } else {
            setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'paid': return 'var(--color-success)';
            case 'delivered': return 'var(--color-primary)';
            case 'processing': return 'orange';
            default: return 'var(--text-secondary)';
        }
    };

    return (
        <div>
            <div className="admin-header">
                <h1>Order Management</h1>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td style={{ fontFamily: 'monospace' }}>#{order.id.slice(0, 8)}</td>
                                <td>{order.profiles?.email || 'Unknown User'}</td>
                                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                <td>₦{Number(order.total_amount).toLocaleString()}</td>
                                <td>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '1rem',
                                        backgroundColor: getStatusColor(order.status) + '20',
                                        color: getStatusColor(order.status),
                                        fontWeight: 'bold',
                                        fontSize: '0.85rem',
                                        textTransform: 'capitalize'
                                    }}>
                                        {order.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="action-btn"
                                            title="Mark Delivered"
                                            onClick={() => updateStatus(order.id, 'delivered')}
                                            style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-success)' }}
                                        >
                                            <CheckCircle size={16} />
                                        </button>
                                        <button
                                            className="action-btn"
                                            title="Mark Processing"
                                            onClick={() => updateStatus(order.id, 'processing')}
                                            style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary)' }}
                                        >
                                            <Truck size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrders;
