import { lazy } from 'react'
import './App.css'
import { BrowserRouter,Routes,Route } from 'react-router';

const LoginPage = lazy(() => import('./pages/login'));
const SignUpPage=lazy(()=>import('./pages/signUpPage'));
const AdminSignUpPage=lazy(()=>import('./pages/adminSignUpPage'));
const HomePage= lazy(()=> import('./pages/homePage'));
const MultiFileUpload=lazy(()=>import('./pages/uploadPage'));
const AccountsPage=lazy(()=>import('./pages/accountsPage'));

function App() {
  
  return (
    <>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<HomePage/>}/>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path='/sign-up' element={<SignUpPage/>}/>
            <Route path='/admin' element={<AdminSignUpPage/>}/>
            <Route path='/upload' element={<MultiFileUpload/>}/>
            <Route path='/accounts' element={<AccountsPage/>}/>
          </Routes>
        </BrowserRouter>
    </>
  )
}

export default App
