import React from 'react';
import ReactDOM from 'react-dom/client';
import { Pow3rBuildApp } from './components/Pow3rBuildApp';
import { ThemeProvider } from './lib/design-system/provider';
import './styles/global.css';

// Mount React app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="pow3r-dark" enableSystemPreference={true}>
      <Pow3rBuildApp 
        dataUrl="/data.json"
        enableSearch={true}
        enableGraph={true}
        enable3D={true}
      />
    </ThemeProvider>
  </React.StrictMode>
);
