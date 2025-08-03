import React from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "@pages/HomePage";
import AboutPage from "@pages/AboutPage";
import CalendarPage from "@pages/CalendarPage";
import FinancesPage from "@pages/FinancesPage";
import SettingsPage from "@pages/SettingsPage";
import NotFoundPage from "@pages/NotFoundPage";
import LoginPage from "@pages/LoginPage";
import CreateAccountPage from "@pages/CreateAccountPage";
import Notes from "@pages/Notes";
import ProtectedRoute from "@shared/components/ProtectedRoute";

import "bootstrap/dist/css/bootstrap.min.css";


const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
        <Route path="finances" element={<ProtectedRoute><FinancesPage /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="login" element={<LoginPage />} />
        <Route path="notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
        <Route path="create-account" element={<CreateAccountPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
