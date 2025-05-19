import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, confirmPasswordReset } from "firebase/auth";

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search);
  const oobCode = query.get('oobCode'); // Firebase bağlantısından gelen kod
  const mode = query.get('mode');

  useEffect(() => {
    // Eğer mode ve oobCode yoksa veya mode resetPassword değilse login'e yönlendir
    if (mode !== 'resetPassword' || !oobCode) {
      navigate('/', { replace: true });
    }
  }, [mode, oobCode, navigate]);

  // Şifre güç kontrol fonksiyonları (register ile aynı)
  const getPasswordStrengthMessage = (pwd) => {
    if (pwd.length < 6) return 'Şifre en az 6 karakter olmalı.';
    if (!/[A-Z]/.test(pwd)) return 'En az bir büyük harf ekleyin.';
    if (!/[a-z]/.test(pwd)) return 'En az bir küçük harf ekleyin.';
    if (!/[0-9]/.test(pwd)) return 'En az bir rakam ekleyin.';
    if (!/[^A-Za-z0-9]/.test(pwd)) return 'En az bir sembol ekleyin.';
    return 'Şifreniz güçlü.';
  };

  const isPasswordStrong = (pwd) => {
    return (
      pwd.length >= 6 &&
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /[0-9]/.test(pwd) &&
      /[^A-Za-z0-9]/.test(pwd)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!oobCode) {
      setMessage("Geçersiz bağlantı.");
      return;
    }

    if (!isPasswordStrong(newPassword)) {
      setMessage(getPasswordStrengthMessage(newPassword));
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Şifreler eşleşmiyor!");
      return;
    }

    const auth = getAuth();

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage("Şifreniz başarıyla güncellendi.");
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      console.error("Şifre sıfırlama hatası:", error);
      setMessage("Şifre güncellenemedi: " + error.message);
    }
  };

  return (
    <div className="auth-form">
      <h2>Yeni Şifre Belirle</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Yeni Şifre:</label>
          <input
            type="password"
            placeholder="Yeni şifreniz"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <small style={{ color: getPasswordStrengthMessage(newPassword) === 'Şifreniz güçlü.' ? 'green' : 'red' }}>
            {newPassword && getPasswordStrengthMessage(newPassword)}
          </small>
        </div>

        <div className="form-group">
          <label>Yeni Şifre Tekrar:</label>
          <input
            type="password"
            placeholder="Yeni şifreniz"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {confirmPassword && (
            <small style={{ color: confirmPassword === newPassword ? 'green' : 'red' }}>
              {confirmPassword === newPassword ? 'Şifreler eşleşiyor.' : 'Şifreler eşleşmiyor.'}
            </small>
          )}
        </div>

        <button type="submit">Şifreyi Güncelle</button>
      </form>
      {message && <p style={{ marginTop: '10px', color: message.includes("başarıyla") ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
}

export default ResetPassword;
