
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

const AdminLayout = () => {
    const { user, isAdmin, signOut, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate('/admin/login');
            } else if (!isAdmin) {
                alert('Access Denied. Admins only.');
                navigate('/');
            }
        }
    }, [user, isAdmin, loading, navigate]);

    if (loading || !user || !isAdmin) return <div className="container">Verifying Admin Access...</div>;

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <div className="admin-dashboard">
            <aside className="admin-sidebar">
                <NavLink to="/admin/dashboard" className="admin-logo">
                    <span className="text-accent">Huulo</span>Admin
                </NavLink>

                <nav className="admin-nav">
                    <NavLink to="/admin/dashboard" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                        <LayoutDashboard size={20} /> Dashboard
                    </NavLink>
                    <NavLink to="/admin/products" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                        <Package size={20} /> Products
                    </NavLink>
                    <NavLink to="/admin/categories" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                        <LayoutDashboard size={20} /> Categories
                    </NavLink>
                    <NavLink to="/admin/orders" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                        <ShoppingBag size={20} /> Orders
                    </NavLink>

                    <button onClick={handleSignOut} className="admin-logout">
                        <LogOut size={20} /> Logout
                    </button>
                </nav>
            </aside>

            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
