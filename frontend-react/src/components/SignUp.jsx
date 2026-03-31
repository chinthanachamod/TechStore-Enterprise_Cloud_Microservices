import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, LayoutDashboard, ArrowRight } from 'lucide-react';

const SignUp = ({ onRegister, message, onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    onRegister({ name, email, password });
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
            <p className="auth-subtitle">Join us to explore the latest technology.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <User className="input-icon" size={20} />
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Kasun Perera"
                  required
                />
              </div>
            </div>

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

            <div className="input-group">
              <label>Confirm Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
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

            <button type="submit" className="btn btn-primary w-full btn-large">
              Create Account <ArrowRight size={18} />
            </button>
          </form>

          {message.text && (
            <div className={`alert alert-${message.type} mt-4`}>
              {message.text}
            </div>
          )}

          <div className="auth-footer">
            <p>Already have an account? <button className="btn-link" onClick={() => onNavigate('signin')}>Sign in instead</button></p>
          </div>
        </div>
      </div>

      <div className="auth-visual signup-visual">
        <div className="visual-content">
          <h2>Unlimited Possibilities</h2>
          <p>Create your free account today and get access to exclusive tech deals and cloud-native management tools.</p>
          <div className="visual-features">
            <div className="feature-item">
              <div className="feature-dot"></div>
              <span>Cloud Management</span>
            </div>
            <div className="feature-item">
              <div className="feature-dot"></div>
              <span>Real-time Sync</span>
            </div>
            <div className="feature-item">
              <div className="feature-dot"></div>
              <span>Secure Transactions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
