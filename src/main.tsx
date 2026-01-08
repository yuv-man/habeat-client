import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { isNativePlatform } from './lib/platform'

// Initialize Google Auth plugin for native platforms
if (isNativePlatform()) {
  import('@southdevs/capacitor-google-auth').then(({ GoogleAuth }) => {
    GoogleAuth.initialize();
  }).catch((error) => {
    console.warn('Failed to initialize Google Auth plugin:', error);
  });
}

createRoot(document.getElementById("root")!).render(<App />);
