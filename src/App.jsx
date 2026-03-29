import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import MentorDashboard from './pages/MentorDashboard';
import ParentDashboard from './pages/ParentDashboard';
import ProfileCreation from './pages/ProfileCreation';
import PersonalityTest from './pages/PersonalityTest';
import AptitudeTest from './pages/AptitudeTest';
import CareerRecommendations from './pages/CareerRecommendations';
import Roadmap from './pages/Roadmap';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/signin"    element={<SignIn />} />
        <Route path="/signup"    element={<SignUp />} />

        {/* Role-based Dashboards */}
        <Route path="/dashboard"        element={<Dashboard />} />
        <Route path="/mentor-dashboard" element={<MentorDashboard />} />
        <Route path="/parent-dashboard" element={<ParentDashboard />} />

        {/* Student Journey */}
        <Route path="/profile-creation"       element={<ProfileCreation />} />
        <Route path="/personality-test"       element={<PersonalityTest />} />
        <Route path="/aptitude-test"          element={<AptitudeTest />} />
        <Route path="/career-recommendations" element={<CareerRecommendations />} />
        <Route path="/roadmap"                element={<Roadmap />} />
      </Routes>
    </Router>
  );
}
