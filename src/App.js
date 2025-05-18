import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './Firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

import Login from './pages/Login';
import Home from './pages/Home';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Yükleniyor...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* PublicRoute: login sayfası */}
        <Route
          path="/login"
          element={
            !user ? <Login /> : <Navigate to="/" replace />
          }
        />

        {/* ProtectedRoute: ana sayfa */}
        <Route
          path="/"
          element={
            user ? <Home /> : <Navigate to="/login" replace />
          }
        />

        {/* 404 veya diğer sayfalar */}
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
