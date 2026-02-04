import { useState } from 'react';

interface SignUpProps {
    onSignUp: (email: string, password: string) => void;
    isLoading?: boolean;
    error?: string;
}

export default function SignUp({ onSignUp, isLoading, error }: SignUpProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [localError, setLocalError] = useState(''); // For password mismatch

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        // ❌ Removed: onSignUp(email, password); - Don't call onSignUp on every keystroke!
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handlePasswordConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordConfirm(e.target.value);
    };

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        
        // Clear local error
        setLocalError('');

        // Check password match
        if (password !== passwordConfirm) {
            setLocalError("Passwords don't match");
            return; // ❌ Fixed: was returning {error} which is wrong
        }

        // Call parent's onSignUp
        onSignUp(email, password);
    };

    return (
        <div className="max-w-md relative flex flex-col p-4 rounded-md text-black bg-gray-200">
            <div className="text-2xl font-bold mb-2 text-[#1e0e4b] text-center">
                Welcome to <span className="text-[#7747ff]">App</span>
            </div>
            <div className="text-sm font-normal mb-4 text-center text-[#1e0e4b]">
                Create your account
            </div>

            {/* Show parent error OR local password mismatch error */}
            {(error || localError) && (
                <div className="mb-4 p-2 bg-red-100 text-red-600 rounded text-sm text-center">
                    {error || localError}
                </div>
            )}

            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                <div className="block relative">
                    <label className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        required
                        className="rounded border bg-white border-gray-200 text-sm w-full font-normal h-11 p-[11px] focus:ring-2 ring-offset-2 ring-gray-900 outline-0"
                        value={email}
                        onChange={handleEmailChange}
                    />
                </div>

                <div className="block relative">
                    <label className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        required
                        className="rounded border border-gray-200 bg-white text-sm w-full font-normal h-11 p-[11px] focus:ring-2 ring-offset-2 ring-gray-900 outline-0"
                        value={password}
                        onChange={handlePasswordChange}
                    />
                </div>

                <div className="block relative">
                    <label className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2">
                        Password Confirm
                    </label>
                    <input
                        type="password"
                        required
                        className="rounded border border-gray-200 bg-white text-sm w-full font-normal h-11 p-[11px] focus:ring-2 ring-offset-2 ring-gray-900 outline-0"
                        value={passwordConfirm}
                        onChange={handlePasswordConfirmChange}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-max m-auto px-6 py-2 rounded text-white text-sm font-normal ${isLoading ? "bg-gray-400" : "bg-[#7747ff]"
                        }`}
                >
                    {isLoading ? "Loading..." : "Sign Up"}
                </button>
            </form>

            <div className="text-sm text-center mt-[1.6rem]">
                Already have an account?{" "}
                <a className="text-sm text-[#7747ff]" href="#">
                    Log in!
                </a>
            </div>
        </div>
    );
}