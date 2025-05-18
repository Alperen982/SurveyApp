import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateSurvey from './pages/CreateSurvey';
import SurveyDetail from './pages/SurveyDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Surveys from './pages/Surveys';
import SurveyDetails from './pages/SurveyDetails';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  if (loading) {
    return <div className="text-center mt-10">Yükleniyor...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Routes>
            {/* Root route: Home if logged in, else Login */}
            <Route
              path="/"
              element={
                user ? <Home /> : <Navigate to="/login" replace />
              }
            />

            {/* Auth-protected routes */}
            <Route
              path="/surveys"
              element={
                user ? <Surveys /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/users/:userId/surveys/:surveyId"
              element={
                user ? <SurveyDetails /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/create-survey"
              element={
                user ? <CreateSurvey /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/survey/:id"
              element={
                user ? <SurveyDetail /> : <Navigate to="/login" replace />
              }
            />

            {/* Public routes */}
            <Route
              path="/login"
              element={
                !user ? <Login /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/register"
              element={
                !user ? <Register /> : <Navigate to="/" replace />
              }
            />

            {/* Catch-all */}
            <Route
              path="*"
              element={<Navigate to={user ? '/' : '/login'} replace />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
