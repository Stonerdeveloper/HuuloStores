
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            // Count Orders
            const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });

            // Calculate Revenue (Basic sum)
            const { data: revenueData } = await supabase.from('orders').select('total_amount').eq('status', 'paid');
            const totalRev = revenueData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

            // Count Products
            const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });

            setStats({
                totalOrders: orderCount || 0,
                totalRevenue: totalRev,
                totalProducts: productCount || 0
            });
        };

        fetchStats();
    }, []);

    return (
        <div>
            <div className="admin-header">
                <h1>Dashboard Overview</h1>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-header">Total Revenue</div>
                    <div className="stat-value">₦{stats.totalRevenue.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-header">Total Orders</div>
                    <div className="stat-value">{stats.totalOrders}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-header">Active Products</div>
                    <div className="stat-value">{stats.totalProducts}</div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
