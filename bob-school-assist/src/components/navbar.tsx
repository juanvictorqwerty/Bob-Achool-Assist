import { useState, useEffect } from "react";
import { LogOut, LogIn, ShieldAlert, Loader2 } from "lucide-react";
import API_BASE_URL from "../config";

const NavBar = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check auth status on mount
    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem("token"));
    }, []);

    const performLogout = async (endpoint: string) => {
        setIsLoading(true);
        setError("");
        const token = localStorage.getItem("token");

        try {
        const response = await fetch(`${API_BASE_URL}/api/auth/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
        });

        if (!response.ok) throw new Error("Logout failed");

        localStorage.clear();
        setIsLoggedIn(false);
        // If using react-router-dom, use useNavigate() here instead
        window.location.href = "/login"; 
        } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
        setIsLoading(false);
        }
    };

    return (
        <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 shadow-sm">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
            BSA
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">Bob School Assistant</span>
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-4">
            {error && (
            <span className="text-xs text-red-500 flex items-center gap-1 bg-red-50 px-2 py-1 rounded">
                <ShieldAlert size={14} /> {error}
            </span>
            )}

            {isLoggedIn ? (
            <div className="flex items-center gap-3">
                <button
                disabled={isLoading}
                onClick={() => performLogout("logout-one-device")}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <LogOut size={18} />}
                Logout
                </button>
                
                <button
                disabled={isLoading}
                onClick={() => performLogout("logout-all-devices")}
                className="px-4 py-2 text-sm font-semibold text-white bg-orange-500 rounded-full hover:bg-orange-600 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                Logout All Devices
                </button>
            </div>
            ) : (
            <a
                href="/login"
                className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-all"
            >
                <LogIn size={18} />
                Login
            </a>
            )}
        </div>
        </nav>
    );
};

export default NavBar;