import { useState } from "react";
import AdminSignUp from "../components/adminSignUp";

interface ApiResponse {
  success: boolean;
  message: string;
  token?: string;
  role?: string;
}

export default function AdminSignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleSignUp = async (
    email: string,
    password: string,
    adminSecret: string
  ) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await fetch("/api/auth/register-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          adminSecret,
        }),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        // Store the admin token and role
        if (data.token && data.role) {
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("userRole", data.role);
        }
        // Redirect to admin dashboard or home
        window.location.href = "/";
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Admin registration error:", err);
      setError("An error occurred. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <AdminSignUp onSignUp={handleSignUp} isLoading={isLoading} error={error} />
    </div>
  );
}
