import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './styles/global.css';

// StrictMode se omite a propósito: monta los efectos dos veces y eso rompe
// la inicialización de OneSignal v16. Si se reintroduce, blindar el init.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
