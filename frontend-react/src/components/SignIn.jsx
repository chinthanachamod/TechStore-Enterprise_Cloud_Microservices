import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LayoutDashboard, ArrowRight } from 'lucide-react';

const SignIn = ({ onLogin, message, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ email, password });
  };

  return (
    <div className="auth-page">
      <div className="auth-overlay"></div>
      <div className="auth-container animate-fade-in">
        <div className="auth-card glass-card">
          <div className="auth-header">
            <div className="logo large">
              <LayoutDashboard size={40} className="icon-primary" />
              <h1>Tech<span>Store</span></h1>
            </div>
            <p className="auth-subtitle">Welcome back! Please enter your details.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={20} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="auth-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>

            <button type="submit" className="btn btn-primary w-full btn-large">
              Sign In <ArrowRight size={18} />
            </button>
          </form>

          {message.text && (
            <div className={`alert alert-${message.type} mt-4`}>
              {message.text}
            </div>
          )}

          <div className="auth-footer">
            <p>Don't have an account? <button className="btn-link" onClick={() => onNavigate('signup')}>Sign up for free</button></p>
          </div>
        </div>
      </div>
      
      <div className="auth-visual">
        <div className="visual-content">
          <h2>Experience the Future of Tech</h2>
          <p>Join thousands of users who trust TechStore for their premium electronics and seamless cloud management.</p>
          <div className="visual-stats">
            <div className="stat">
              <span className="stat-value">99%</span>
              <span className="stat-label">Uptime</span>
            </div>
            <div className="stat">
              <span className="stat-value">24/7</span>
              <span className="stat-label">Support</span>
            </div>
            <div className="stat">
              <span className="stat-value">128+</span>
              <span className="stat-label">Services</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
