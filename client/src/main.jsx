import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { GlobalProvider } from './context/GlobalState';
import { BookProvider } from './context/CautaState.jsx';
import { BazarProvider } from './context/BazarState.jsx';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <GlobalProvider>
        <BookProvider>
          <BazarProvider>
            <App />
          </BazarProvider>
        </BookProvider>
      </GlobalProvider>
    </HashRouter>
  </StrictMode>,
);
