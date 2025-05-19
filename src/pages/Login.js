import { useState } from 'react';
import { signInWithSession} from '../Firebase/config';
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth, sendPasswordResetEmail, fetchSignInMethodsForEmail } from "firebase/auth";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const redirectTo = params.get('next') || '/Home';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

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

  const handleResetPassword = async () => {
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedEmail) {
    setResetMessage("Lütfen önce e-posta adresinizi girin.");
    return;
  }

  const auth = getAuth();

  try {
    const methods = await fetchSignInMethodsForEmail(auth, trimmedEmail);

    if (!methods || methods.length === 0) {
      setResetMessage("Böyle bir e-posta adresi sistemde kayıtlı değil.");
      return;
    }

    await sendPasswordResetEmail(auth, trimmedEmail);
    setResetMessage("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
  } catch (error) {
    console.error("Şifre sıfırlama hatası:", error);
    setResetMessage("Şifre sıfırlama başarısız. Lütfen tekrar deneyin.");
  }
};

  const closePopup = () => {
    setShowError(false);
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

       <button type="button" onClick={handleResetPassword} style={{ marginTop: '10px' }}>
        Şifremi Unuttum
      </button>
      {resetMessage && (
        <p style={{ marginTop: '10px', color: resetMessage.includes("gönderildi") ? 'green' : 'red' }}>
          {resetMessage}
        </p>
      )}

    </div>
  );
}

export default Login; 