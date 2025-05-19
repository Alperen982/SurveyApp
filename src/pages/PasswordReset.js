import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getAuth, confirmPasswordReset } from "firebase/auth";

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const oobCode = query.get('oobCode'); // Firebase bağlantısından gelen kod

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!oobCode) {
      setMessage("Geçersiz bağlantı.");
      return;
    }

    const auth = getAuth();
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage("Şifreniz başarıyla güncellendi.");
    } catch (error) {
      console.error("Şifre sıfırlama hatası:", error);
      setMessage("Şifre güncellenemedi: " + error.message);
    }
  };

  return (
    <div>
      <h2>Yeni Şifre Belirle</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Yeni şifreniz"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button type="submit">Şifreyi Güncelle</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ResetPassword;