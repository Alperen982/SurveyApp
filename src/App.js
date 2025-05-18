import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './Firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Home from './pages/Home';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      {/* Navbar her zaman görünür */}
      <Navbar />

      <Routes>
        {/* Ana route: kullanıcı durumuna göre yönlendir */}
        <Route
          path="/"
          element={
            user
              ? <Home />
              : <Navigate to="/login" replace />
          }
        />

        {/* Login sayfası */}
        <Route
          path="/login"
          element={
            !user
              ? <Login />
              : <Navigate to="/" replace />
          }
        />

        {/* Diğer rotalar */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
