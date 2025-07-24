import React from 'react';
import './Auth.css';
import logo from '../assets/logo.svg';
import AuthForm from '../components/AuthForm';

function Auth() {
  return (
    <div className="auth-page">
      <div className="auth-left">
        <img src={logo} alt="Logo" className="auth-logo" />
        <h1 className="app-title">PaperPal</h1>
      </div>
      <div className="auth-right">
        <AuthForm />
      </div>
    </div>
  );
}

export default Auth;

