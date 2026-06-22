import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import Modal from './modal/modal.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {/* Modal - State dikelola dari Zustand store */}
    <Modal />
  </StrictMode>,
)
