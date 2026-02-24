import React, { useState, useContext } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import authService from '../services/authService';

import './login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await authService.login(formData.email, formData.password);
      if (response.token) {
        login(response.user);
        navigate('/dashboard');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container1">
      <Helmet>
        <title>login - SureFix</title>
        <meta property="og:title" content="login - SureFix" />
        <link
          rel="canonical"
          href="https://surefix-9edajs.teleporthq.app/login"
        />
      </Helmet>
      
      <div className="login-thq-login-elm">
        <div className="login-thq-group89-elm">
          <div className="login-thq-group88-elm">
            <div className="login-thq-group86-elm">
              <div className="login-thq-group32-elm">
                <span className="login-thq-text-elm1">SureFix</span>
                
                <div className="login-thq-group3-elm">
                  <span className="login-thq-text-elm3">Login</span>
                </div>
                
                <div className="login-thq-group4-elm">
                  <span className="login-thq-text-elm2">E-mail</span>
                  <input
                    type="email"
                    name="email"
                    placeholder=""
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="login-email-input"
                  />
                </div>
                
                <div className="login-thq-group2-elm">
                  <span className="login-thq-text-elm4">Password</span>
                  <input
                    type="password"
                    name="password"
                    placeholder=""
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="login-password-input"
                  />
                </div>
                
                {error && <div className="login-error">{error}</div>}
                
                <button 
                  type="submit" 
                  className="login-submit-btn" 
                  disabled={loading}
                  onClick={handleSubmit}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
                
                <div className="login-thq-text-elm5">
                  <span className="login-thq-text-elm6">
                    Forgot Password?
                  </span>
                  <span className="login-thq-text-elm7">or</span>
                  <span> 
                    <a href="/register" style={{color: '#2874de', textDecoration: 'none'}}> Signup</a>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <a href="https://play.teleporthq.io/signup" className="login-link">
        <div aria-label="Sign up to TeleportHQ" className="login-container2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 19 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="login-icon1"
          >
            <path
              d="M9.1017 4.64355H2.17867C0.711684 4.64355 -0.477539 5.79975 -0.477539 7.22599V13.9567C-0.477539 15.3829 0.711684 16.5391 2.17867 16.5391H9.1017C10.5687 16.5391 11.7579 15.3829 11.7579 13.9567V7.22599C11.7579 5.79975 10.5687 4.64355 9.1017 4.64355Z"
              fill="#B23ADE"
            ></path>
            <path
              d="M10.9733 12.7878C14.4208 12.7878 17.2156 10.0706 17.2156 6.71886C17.2156 3.3671 14.4208 0.649963 10.9733 0.649963C7.52573 0.649963 4.73096 3.3671 4.73096 6.71886C4.73096 10.0706 7.52573 12.7878 10.9733 12.7878Z"
              fill="#FF5C5C"
            ></path>
            <path
              d="M17.7373 13.3654C19.1497 14.1588 19.1497 15.4634 17.7373 16.2493L10.0865 20.5387C8.67402 21.332 7.51855 20.6836 7.51855 19.0968V10.5141C7.51855 8.92916 8.67402 8.2807 10.0865 9.07221L17.7373 13.3654Z"
              fill="#2874DE"
            ></path>
          </svg>
          <span className="login-text">Built in TeleportHQ</span>
        </div>
      </a>
    </div>
  );
};

export default Login;
