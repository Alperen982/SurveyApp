import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithSession } from '../Firebase/config';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = new URLSearchParams(location.search).get('next') || '/Home';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await signInWithSession(email, password);
      if (user) {
        navigate(redirectTo);
      } else {
        alert('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      }
    } catch (error) {
      console.error('Giriş sırasında hata oluştu:', error);
      // Firebase auth errors
      if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/user-not-found'
      ) {
        alert('Email veya şifre hatalı. Lütfen kontrol edin.');
      } else {
        alert('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Giriş Yap</button>
      </form>
    </div>
  );
}

export default Login;
