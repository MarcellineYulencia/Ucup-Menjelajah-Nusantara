// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Tambahkan ini
import App from './App';
import './App.css';
import { StatusProvider } from './contexts/StatusContext'; // pastikan path benar

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* Tambahkan ini */}
    <StatusProvider>
      <App />
    </StatusProvider>
    </BrowserRouter>
  </React.StrictMode>
);
