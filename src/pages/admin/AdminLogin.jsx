
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import '../Login.css'; // Reusing styles

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    shouldCreateUser: false, // Admins must exist already
                    emailRedirectTo: window.location.origin + '/admin/dashboard',
                },
            });

            if (error) throw error;
            setMessage('Check your email for the magic link!');
        } catch (error) {
            setError(error.message || 'Error processing request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page container">
            <div className="auth-card" style={{ borderColor: 'var(--color-primary)' }}>
                <h1 className="text-accent">Admin Login</h1>
                <p className="auth-subtitle">Passwordless access for staff only</p>

                {error && <div className="auth-error">{error}</div>}
                {message && <div className="auth-error" style={{ borderColor: 'var(--color-success)', color: 'var(--color-success)', backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>{message}</div>}

                <form onSubmit={handleLogin} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Admin Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="admin@huulostores.com"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-auth">
                        {loading ? 'Sending Link...' : 'Send Magic Link'}
                    </button>
                </form>

                <div className="auth-footer">
                    <Link to="/">Return to Home</Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
