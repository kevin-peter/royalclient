import React from "react";
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { StrictMode } from 'react';

//import './index.css';
import App from './App.jsx';
import { Store } from './Store.jsx';
import "./css/variable.css";
//import 'bootstrap/dist/css/bootstrap.min.css';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.VITE_BASE_URL}>
    <Store>
      <App />
      </Store>
    </BrowserRouter>
  </StrictMode>
);
