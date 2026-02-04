import { lazy } from 'react'
import './App.css'
import { BrowserRouter,Routes,Route } from 'react-router';

const LoginPage = lazy(() => import('./pages/login'));
const SignUpPage=lazy(()=>import('./pages/signUpPage'))
const HomePage= lazy(()=> import('./pages/homePage'))

function App() {
  
  return (
    <>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<HomePage/>}/>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path='/sign-up' element={<SignUpPage/>}/>
          </Routes>
        </BrowserRouter>
    </>
  )
}

export default App
