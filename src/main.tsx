import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const isFirstVisit = localStorage.getItem('isFirstVisit') === null;
if (isFirstVisit) {
  localStorage.setItem('isFirstVisit', 'false');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
