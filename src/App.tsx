import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "@pages/HomePage";
import AboutPage from "@pages/AboutPage";
import CalendarPage from "@pages/CalendarPage";
import FinancesPage from "@pages/FinancesPage";
import SettingsPage from "@pages/SettingsPage";
import NotFoundPage from "@pages/NotFoundPage";
import LoginPage from "@pages/LoginPage";
import CreateAccountPage from "@pages/CreateAccountPage";

import "bootstrap/dist/css/bootstrap.min.css";
import Notes from "@pages/Notes";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="finances" element={<FinancesPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="notes" element={<Notes />} />
        <Route path="create-account" element={<CreateAccountPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
