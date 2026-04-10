// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Navigate } from "react-router-dom";

// Auth Pages
import Login3D from './pages/auth/Login3D';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Main Pages
import Dashboard from './pages/Dashboard';
import MealPlanner from './pages/MealPlanner';
import WorkoutPlanner from './pages/WorkoutPlanner';
import ARWorkout from './pages/ARWorkout';   
import Profile from './pages/Profile';
import LetsBuildYou from './pages/LetsBuildYou';   // ✅ NEW PAGE IMPORT

// Components
import ProtectedRoute from './components/ProtectedRoute';
import AppNavbar from './components/AppNavbar';

// Contexts
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={3000} />
        <AppNavbar />  

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login3D />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />  {/* ✅ default redirect */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/meal-planner" element={<MealPlanner />} />
            <Route path="/workout-planner" element={<WorkoutPlanner />} />
            <Route path="/ar-workout" element={<ARWorkout />} />
            <Route path="/profile" element={<Profile />} />

            {/* ✅ New Feature Route */}
            <Route path="/lets-build-you" element={<LetsBuildYou />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
