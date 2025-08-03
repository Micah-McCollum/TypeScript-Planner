import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from "@contexts/AuthContext";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ProtectedRoute from "@shared/components/ProtectedRoute";

import App from './App';

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root not found");

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);