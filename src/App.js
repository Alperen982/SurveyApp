import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import ResetPassword from './pages/PasswordReset';
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

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  // Firebase reset password linkinden gelen parametreyi yakalama ve yönlendirme
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get("mode");
    const oobCode = params.get("oobCode");

    if (mode === "resetPassword" && oobCode) {
      navigate(`/reset-password?mode=${mode}&oobCode=${oobCode}`);
    }
  }, [location.search, navigate]);


  if (loading) {
    return <div className="text-center mt-10">Yükleniyor...</div>;
  }

   return (
    <div className="container">
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/"
          element={user ? <Home /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/surveys"
          element={user ? <Surveys /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/users/:userId/surveys/:surveyId"
          element={user ? <SurveyDetails /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/create-survey"
          element={user ? <CreateSurvey /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/survey/:id"
          element={user ? <SurveyDetail /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" replace />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/" replace />}
        />
        <Route
          path="*"
          element={<Navigate to={user ? '/' : '/login'} replace />}
        />
      </Routes>
    </div>
  );
}

export default App;
