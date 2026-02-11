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

    if (!response.ok) {
        throw new Error("Invalid credentials");
        }

        const data = await response.json();

      // Store token (localStorage or httpOnly cookie)
        localStorage.setItem("token", data.token);
      // Redirect to dashboard or home
        window.location.href = "/";
    } catch (err) {
        setError(err instanceof Error ? err.message : "Login failed");
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