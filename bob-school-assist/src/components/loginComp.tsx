import {useState, type SetStateAction} from 'react'

export default function LoginComp(){

      // ✅ CORRECT: useState must be inside the component function
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Handle input changes
    const handleEmailChange = (e: { target: { value: SetStateAction<string>; }; }) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e: { target: { value: SetStateAction<string>; }; }) => {
        setPassword(e.target.value);
    };

    // Handle form submission
    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        console.log('Email:', email);
        console.log('Password:', password);
        // Add your login logic here
    };
    return(
    <div className="max-w-md relative flex flex-col p-4 rounded-md text-black bg-gray-200">
        <div className="text-2xl font-bold mb-2 text-[#1e0e4b] text-center">Welcome back to <span className="text-[#7747ff]">App</span></div>
        <div className="text-sm font-normal mb-4 text-center text-[#1e0e4b]">Log in to your account</div>
    <form className="flex flex-col gap-3">
        <div className="block relative"> 
        <label  className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2">Email</label>
        <input 
            type="text" 
            className="rounded border bg-white border-gray-200 text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-2.75 focus:ring-2 ring-offset-2  ring-gray-900 outline-0"
            value={email}                    // Controlled input
            onChange={handleEmailChange}
            />
        
        </div>
        <div className="block relative"> 
        <label  className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2">Password</label>
        <input type="text" 
        className="rounded border border-gray-200 bg-white text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-2.75 focus:ring-2 ring-offset-2 ring-gray-900 outline-0"
        value={password}
        onChange={handlePasswordChange}
        />
        
        </div>
        <div>
        <a className="text-sm text-[#7747ff]" href="#">Forgot your password?
        </a></div>
        <button type="submit"
        className="bg-[#7747ff] w-max m-auto px-6 py-2 rounded text-white text-sm font-normal"
        onClick={handleSubmit}>
            Submit
        </button>

    </form>
    <div className="text-sm text-center mt-[1.6rem]">Don’t have an account yet? <a className="text-sm text-[#7747ff]" href="#">Sign up for free!</a></div>
    </div>
    )
    }