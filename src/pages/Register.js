import { useState } from 'react';
import { auth, db, doc, setDoc, createUserWithEmailAndPassword } from '../Firebase/config';
import React from 'react';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Şifreler eşleşmiyor!');
      return;
    }        
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential)=> {
      const user=userCredential.user;
      const userData={
        email: email,
        password: password
      };
      alert("Hesap başarıyla oluşturuldu.");
      const docRef = doc(db, "users", user.uid);
      setDoc(docRef, userData)
      .then(()=>{
        document.location.href="/Home";
      })
      .catch((error)=>{
        console.error("error writing document", error);

      });
    })
    .catch((error)=>{
      const errorCode = error.code;
      if(errorCode === 'auth/email-already-in-use'){
        alert("Bu mail adresi zaten kullanılıyor.");
      }
      else{
        alert("Hesap oluşturulamadı.");

      }
    })
    console.log({ email, password });
  };

  return (
    <div className="auth-form">
      <h2>Kayıt Ol</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            placeholder="Geçerli bir mail giriniz."
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Şifre:</label>
          <input
            type="password"
            value={password}
            placeholder="En az 6 karakter giriniz."
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Şifre Tekrar:</label>
          <input
            type="password"
            value={confirmPassword}
            placeholder="En az 6 karakter giriniz."
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Kayıt Ol</button>
      </form>
    </div>
  );
}

export default Register; 