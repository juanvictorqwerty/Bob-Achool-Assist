import LoginComp from "../components/loginComp"
import { useState } from "react";

const LoginPage=()=>{

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError("");

    try {
        const response = await fetch("http://localhost:4000/api/auth/login-user", {
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
        <div>
            <div className="flex h-screen items-center justify-center">
                <LoginComp onLogin={handleLogin} isLoading={isLoading} error={error}/>
            </div>
        </div>
    )
}
export default LoginPage