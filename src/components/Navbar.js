import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import { onAuthStateChanged, auth, signOut } from "../Firebase/config";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Çıkış başarılı.");
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Çıkış sırasında bir hata oluştu:", error.message);
    }
  };

  if (isLoggedIn === null) {
    return <div>Yükleniyor...</div>;
  }

  if (isLoggedIn) {
    return (
      <nav className="navbar">
        <div className="container">
          <Link to="/surveys" className="nav-logo">SurveyApp</Link>
          <div className="nav-links">
            <Link to="/Home" className="nav-link">Profil</Link>
            <Link to="/surveys" className="nav-link">Etkinliklerim</Link>
            <Link to="/create-survey" className="nav-link">Etkinlik Oluştur</Link>
            <a href="/login" className="nav-link" onClick={handleLogout}>
              Çıkış Yap
            </a>
          </div>
        </div>
      </nav>
    );
  } else {
    return (
      <nav className="navbar">
        <div className="container">
          <Link to="/surveys" className="nav-logo">SurveyApp</Link>
          <div className="nav-links">
            <Link to="/login" className="nav-link">Giriş Yap</Link>
            <Link to="/register" className="nav-link">Kayıt Ol</Link>
          </div>
        </div>
      </nav>
    );
  }
}

export default Navbar; 