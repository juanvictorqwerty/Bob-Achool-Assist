import { useState } from "react";
import { Link } from "react-router-dom";

// Constants for maintainable configuration
const ROUTES = {
  SIGN_UP: "/sign-up",
  FORGOT_PASSWORD: "#",
} as const;

// Reusable link styles to ensure consistency
const LINK_STYLES = "text-sm text-[#7747ff] hover:text-[#5e36cc] transition-colors duration-200 cursor-pointer";

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
    
    // Validate inputs before submission
    if (!email.trim() || !password.trim()) {
      console.warn("Email and password are required");
      return;
    }
    
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
        <div 
          className="mb-4 p-2 bg-red-100 text-red-600 rounded text-sm text-center"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <div className="block relative">
          <label 
            htmlFor="email"
            className="block text-gray-600 text-sm font-normal mb-2"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            aria-required="true"
            className="rounded border border-gray-200 text-sm w-full font-normal h-11 p-[11px] focus:ring-2 ring-offset-2 ring-gray-900 outline-0"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            aria-describedby={error ? "login-error" : undefined}
          />
        </div>

        <div className="block relative">
          <label 
            htmlFor="password"
            className="block text-gray-600 text-sm font-normal mb-2"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            aria-required="true"
            className="rounded border border-gray-200 text-sm w-full font-normal h-11 p-[11px] focus:ring-2 ring-offset-2 ring-gray-900 outline-0"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <Link 
            to={ROUTES.FORGOT_PASSWORD}
            className={LINK_STYLES}
            aria-label="Forgot your password?"
          >
            Forgot your password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-max m-auto px-6 py-2 rounded text-white text-sm font-normal ${
            isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#7747ff] hover:bg-[#5e36cc] transition-colors duration-200"
          }`}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <span className="sr-only">Logging in</span>
              Loading...
            </>
          ) : "Submit"}
        </button>
      </form>

      <div 
        className="text-sm text-center mt-[1.6rem]"
        role="contentinfo"
        aria-label="Account registration"
      >
        <span className="text-gray-600">Don't have an account yet? </span>
        <Link 
          to={ROUTES.SIGN_UP}
          className={LINK_STYLES}
          aria-label="Sign up for free"
        >
          Sign up for free!
        </Link>
      </div>
    </div>
  );
}
