import { useState } from 'react';
import { signInWithSession} from '../Firebase/config';
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const redirectTo = params.get('next') || '/Home';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const user = await signInWithSession(email, password);
    if (user) {
      navigate(redirectTo);
    } else {
      setError("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
    }
  } catch (error) {
    console.error("Login error:", error);
    setError("Bir hata oluştu. Lütfen tekrar deneyin.");
  }
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