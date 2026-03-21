
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import AuthProvider from './context/UseContext.tsx'
import './i18n/index.tsx';
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <BrowserRouter>
      <App />
       <ToastContainer />
    </BrowserRouter>

  </AuthProvider>

)
