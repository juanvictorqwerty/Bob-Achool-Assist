import { lazy } from 'react'
import './App.css'
import { BrowserRouter,Routes,Route } from 'react-router';

const LoginPage = lazy(() => import('./pages/login'));

function App() {
  

  return (
    <>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage/>}/>
          </Routes>
        </BrowserRouter>
    </>
  )
}

export default App
