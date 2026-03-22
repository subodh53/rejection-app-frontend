import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './store/AuthContext.tsx'
import { MasterDataProvider } from './store/MasterDataContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <MasterDataProvider>
        <App />
      </MasterDataProvider>
    </AuthProvider>
  </StrictMode>,
)

