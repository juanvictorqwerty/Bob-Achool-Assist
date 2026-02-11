import { useState } from "react";

interface LoginCompProps {
    onLogin: (email: string, password: string) => void;
    isLoading?: boolean;
    error?: string;
}

export default function LoginComp({ onLogin, isLoading, error }: LoginCompProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    onLogin(email, password);
    };

    return (
        <div className="max-w-md relative flex flex-col p-4 rounded-md text-black bg-white">
        <div className="text-2xl font-bold mb-2 text-[#1e0e4b] text-center">
            Welcome back to <span className="text-[#7747ff]">App</span>
        </div>
        <div className="text-sm font-normal mb-4 text-center text-[#1e0e4b]">
            Log in to your account
        </div>

        {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-600 rounded text-sm text-center">
            {error}
            </div>
        )}

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <div className="block relative">
            <label className="block text-gray-600 text-sm font-normal mb-2">
                Email
            </label>
            <input
                type="email"
                required
                className="rounded border border-gray-200 text-sm w-full font-normal h-11 p-[11px] focus:ring-2 ring-offset-2 ring-gray-900 outline-0"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            </div>

            <div className="block relative">
            <label className="block text-gray-600 text-sm font-normal mb-2">
                Password
            </label>
            <input
                type="password"
                required
                className="rounded border border-gray-200 text-sm w-full font-normal h-11 p-[11px] focus:ring-2 ring-offset-2 ring-gray-900 outline-0"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            </div>

            <div>
            <a className="text-sm text-[#7747ff]" href="#">
                Forgot your password?
            </a>
            </div>

            <button
            type="submit"
            disabled={isLoading}
            className={`w-max m-auto px-6 py-2 rounded text-white text-sm font-normal ${
                isLoading ? "bg-gray-400" : "bg-[#7747ff]"
            }`}
            >
            {isLoading ? "Loading..." : "Submit"}
            </button>
        </form>

        <div className="text-sm text-center mt-[1.6rem]">
            Don't have an account yet?{" "}
            <a className="text-sm text-[#7747ff]" href="#">
            Sign up for free!
            </a>
        </div>
        </div>
    );
}