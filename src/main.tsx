import React from 'react';
import ReactDOM from 'react-dom/client';
import { Pow3rBuildApp } from './components/Pow3rBuildApp';
import './styles/global.css';

// Mount React app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Pow3rBuildApp 
      dataUrl="/pow3r.status.config.json"
      enableSearch={true}
      enableGraph={true}
      enable3D={true}
    />
  </React.StrictMode>
);
