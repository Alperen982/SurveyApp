import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateSurvey from './pages/CreateSurvey';
import SurveyDetail from './pages/SurveyDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Surveys from './pages/Surveys';
import SurveyDetails from './pages/SurveyDetails';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Home" element={<Home />} />
            <Route path="/surveys" element={<Surveys />} />
            <Route path="/users/:userId/surveys/:surveyId" element={<SurveyDetails />} /> {/* Anket detay sayfası */}
            <Route path="/create-survey" element={<CreateSurvey />} />
            <Route path="/survey/:id" element={<SurveyDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App; 