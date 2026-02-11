import SignUp from "../components/signUp";
import { useState } from "react";
import API_BASE_URL from "../config";

const SignUpPage=()=>{


    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSignUp = async (email: string, password: string) => {
    setIsLoading(true);
    setError("");

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register-user`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            // Show server error message, fallback to error field, then generic message
            const errorMessage = data.message || data.error || "Registration failed";
            console.error("Server error:", data); // Log full error for debugging
            throw new Error(errorMessage);
        }

        // Store token (localStorage or httpOnly cookie)
        localStorage.setItem("token", data.token);
        // Redirect to dashboard or home
        window.location.href = "/";
    } catch (err) {
        console.error("SignUp error:", err);
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unknown error occurred");
        }
    } finally {
        setIsLoading(false);
    }
    };

    return(
        <div className="flex h-screen items-center justify-center">
            <SignUp onSignUp={handleSignUp} isLoading={isLoading} error={error}/>
        </div>
    )
}
export default SignUpPage;
