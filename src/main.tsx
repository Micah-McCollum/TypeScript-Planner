import React from "react";
import { createRoot } from "react-dom/client";
import './styles/index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';



const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root not found");

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);