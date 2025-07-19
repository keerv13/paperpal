import { useNavigate, Link } from 'react-router-dom';
import React, { useState } from 'react';
import axios from 'axios';

function AuthForm() {
  const [mode, setMode] = useState('login');
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const axiosPostData = async () => {
    try {
      const { data, status } = await axios.post('http://localhost:4000/auth', {
        email,
        password,
        mode,
      });

      if (status === 200 || status === 201) {
        // Save it somewhere global – localStorage, a Context, or even a Redux store.
        localStorage.setItem('userId', data.user_id);
        navigate('/dashboard');
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.statusText || err.message);
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (mode === 'signup' && password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setError('');
    axiosPostData();
  };

  return (
    <div className="auth-form-container">
      <div className="auth-toggle">
        <button
          className={mode === 'login' ? 'active' : ''}
          onClick={() => setMode('login')}
        >
          Login
        </button>
        <button
          className={mode === 'signup' ? 'active' : ''}
          onClick={() => setMode('signup')}
        >
          Signup
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {mode === 'login' && (
          <Link to="/forgot-password" className="forgot-link">
         Forgot password?
         </Link>
        )}

        {error && <p className="error-message">{error}</p>}

        <button type="submit">{mode === 'login' ? 'Login' : 'Sign Up'}</button>
      </form>
    </div>
  );
}

export default AuthForm;
