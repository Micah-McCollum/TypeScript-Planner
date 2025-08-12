import React from "react";

import App from './App';
import { createRoot } from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from "@contexts/AuthContext";
import NotificationProvider from "@contexts/NotificationContext";

import 'bootstrap/dist/css/bootstrap.min.css';

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root not found");

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>
);