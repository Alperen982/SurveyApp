import { useState } from 'react';
import { signInWithSession} from '../Firebase/config';
import React from 'react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  

  const handleSubmit = (e) => {
    e.preventDefault();
    signInWithSession(email, password).then((user)=> {
        window.location.href = "/Home";
    });
  };

  return (
    <div className="auth-form">
      <h2>Giriş Yap</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            id = "lMail"
            type="email"
            value={email}
            placeholder="Mail adresinizi giriniz."
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Şifre:</label>
          <input
            id = "lPassword"
            type="password"
            value={password}
            placeholder="Şifrenizi giriniz."
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submitLogin">Giriş Yap</button>
      </form>
    </div>
  );
}

export default Login; 