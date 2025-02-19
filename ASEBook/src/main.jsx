import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { GlobalProvider } from './context/GlobalState';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <GlobalProvider>
        <App />
      </GlobalProvider>
    </HashRouter>
  </StrictMode>,
);
