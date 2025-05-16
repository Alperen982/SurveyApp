import { useState } from 'react';
import { signInWithSession} from '../Firebase/config';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  

  const handleSubmit = (e) => {
    e.preventDefault();
    signInWithSession(email, password).then((user)=> {
      if (window.history.length > 1) {
        console.log("Geçmiş bulundu, bir önceki sayfaya yönlendiriliyor...");
        window.history.back();
      } else {
        console.log("Geçmiş bulunamadı, varsayılan sayfaya yönlendiriliyor...");
        window.location.href = "/login";
      }
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