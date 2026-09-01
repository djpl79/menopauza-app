import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App';
import { API_URL } from './config';
import './index.css';

axios.defaults.baseURL = API_URL;
console.log('🚀 Menopauza App starting, API_URL =', API_URL);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
