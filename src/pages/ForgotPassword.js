import React, { useState } from 'react';
import './ResetPassword.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/auth/forgot-password', { email });
      setMessage(data.message);
    } catch (err) {
      console.error('ForgotPassword error:', err);
      setMessage(
        err.response
          ? `Error: ${err.response.status} – ${err.response.data?.message}`
          : err.message
      );
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="auth-form-container">
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Your email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <button type="submit">Send Reset Link</button>
        </form>
        {message && <p>{message}</p>}
        <p>
          <Link to="/">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
