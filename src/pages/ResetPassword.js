import React, { useState } from 'react';
import './ResetPassword.css';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';


export default function ResetPassword() {
  const { token }   = useParams();
  const navigate    = useNavigate();
  const [password, setPassword] = useState('');
  const [message,  setMessage]  = useState('');
  const [error,    setError]    = useState('');

  const handleSubmit = async e => {
    e.preventDefault();

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError('');

    try {
      const { data } = await axios.post(`/auth/reset-password/${token}`, { password });
      setMessage(data.message);          
      setTimeout(() => navigate('/'), 7000); 
    } catch (err) {
      console.error('ResetPassword error:', err);
      const msg = err.response?.data?.message || err.message;
      setError(`Error: ${msg}`);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="auth-form-container">
        <h2>Reset Your Password</h2>

        {message && <p className="success-message">{message}</p>}
        {error   && <p className="error-message">{error}</p>}

        {!message && (
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button type="submit">Set New Password</button>
          </form>
        )}

        <p>
          <Link to="/">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
