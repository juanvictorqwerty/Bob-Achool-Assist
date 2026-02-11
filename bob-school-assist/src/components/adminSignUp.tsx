import { useState } from "react";
import { Link } from "react-router-dom";

// Constants for maintainable configuration
const ROUTES = {
  LOGIN: "/login",
} as const;

// Reusable link styles to ensure consistency
const LINK_STYLES = "text-sm text-[#7747ff] hover:text-[#5e36cc] transition-colors duration-200 cursor-pointer";

interface AdminSignUpProps {
  onSignUp: (email: string, password: string, adminSecret: string) => void;
  isLoading?: boolean;
  error?: string;
}

export default function AdminSignUp({ onSignUp, isLoading, error }: AdminSignUpProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [adminSecret, setAdminSecret] = useState("");
  const [localError, setLocalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handlePasswordConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordConfirm(e.target.value);
  };

  const handleAdminSecretChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminSecret(e.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear local error
    setLocalError("");

    // Validate password match
    if (password !== passwordConfirm) {
      setLocalError("Passwords don't match");
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters long");
      return;
    }

    // Validate admin secret
    if (!adminSecret.trim()) {
      setLocalError("Admin secret is required");
      return;
    }

    // Call parent's onSignUp
    onSignUp(email, password, adminSecret);
  };

  return (
    <div className="max-w-md relative flex flex-col p-4 rounded-md text-black bg-gray-200">
      <div className="text-2xl font-bold mb-2 text-[#1e0e4b] text-center">
        Admin <span className="text-[#7747ff]">Registration</span>
      </div>
      <div className="text-sm font-normal mb-4 text-center text-[#1e0e4b]">
        Create an admin account
      </div>

      {/* Show parent error OR local validation error */}
      {(error || localError) && (
        <div
          className="mb-4 p-2 bg-red-100 text-red-600 rounded text-sm text-center"
          role="alert"
          aria-live="polite"
        >
          {error || localError}
        </div>
      )}

      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <div className="block relative">
          <label
            htmlFor="email"
            className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            aria-required="true"
            className="rounded border bg-white border-gray-200 text-sm w-full font-normal h-11 p-[11px] focus:ring-2 ring-offset-2 ring-gray-900 outline-0"
            value={email}
            onChange={handleEmailChange}
            disabled={isLoading}
            placeholder="admin@school.edu"
          />
        </div>

        <div className="block relative">
          <label
            htmlFor="adminSecret"
            className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2"
          >
            Admin Secret Key
          </label>
          <input
            id="adminSecret"
            type="password"
            required
            aria-required="true"
            className="rounded border bg-white border-gray-200 text-sm w-full font-normal h-11 p-[11px] focus:ring-2 ring-offset-2 ring-gray-900 outline-0"
            value={adminSecret}
            onChange={handleAdminSecretChange}
            disabled={isLoading}
            placeholder="Enter admin registration secret"
          />
        </div>

        <div className="block relative">
          <label
            htmlFor="password"
            className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              aria-required="true"
              className="rounded border border-gray-200 bg-white text-sm w-full font-normal h-11 p-[11px] focus:ring-2 ring-offset-2 ring-gray-900 outline-0 pr-10"
              value={password}
              onChange={handlePasswordChange}
              disabled={isLoading}
              placeholder="At least 8 characters"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "👁️" : "🔒"}
            </button>
          </div>
        </div>

        <div className="block relative">
          <label
            htmlFor="passwordConfirm"
            className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2"
          >
            Confirm Password
          </label>
          <input
            id="passwordConfirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            aria-required="true"
            className="rounded border border-gray-200 bg-white text-sm w-full font-normal h-11 p-[11px] focus:ring-2 ring-offset-2 ring-gray-900 outline-0"
            value={passwordConfirm}
            onChange={handlePasswordConfirmChange}
            disabled={isLoading}
            placeholder="Confirm your password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-max m-auto px-6 py-2 rounded text-white text-sm font-normal ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#7747ff] hover:bg-[#5e36cc] transition-colors duration-200"
          }`}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <span className="sr-only">Registering admin</span>
              Loading...
            </>
          ) : (
            "Register as Admin"
          )}
        </button>
      </form>

      <div
        className="text-sm text-center mt-[1.6rem]"
        role="contentinfo"
        aria-label="Login link"
      >
        <span className="text-gray-600">Already have an admin account? </span>
        <Link to={ROUTES.LOGIN} className={LINK_STYLES} aria-label="Log in">
          Log in!
        </Link>
      </div>
    </div>
  );
}
