import { useState } from "react";


const NavBar=()=>{
    const[isLoading,setIsLoading]=useState(false);
    const [error,setError]=useState("")

    const handleLogout=async()=>{
        setIsLoading(true);
        setError("");
        const token=localStorage.getItem('token')
        try {
            const response= await fetch("http://localhost:4000/api/auth/logout-one-device",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                },
                body: JSON.stringify({token})
            })

        if(!response.ok){
            throw new Error("Something went wrong")
        }
        localStorage.clear()
        window.location.href="/login"    
        }
        catch (err){
            setError(err instanceof Error ? err.message: "Something is wrong");
        }
        finally{
            setIsLoading(false);
        }
    }

    const handleLogoutAll=async()=>{
        setIsLoading(true);
        setError("");
        const token=localStorage.getItem('token')
        try {
            const response= await fetch("http://localhost:4000/api/auth/logout-all-devices",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                },
                body: JSON.stringify({token})
            })

        if(!response.ok){
            throw new Error("Something went wrong")
        }
        localStorage.clear()
        window.location.href="/login"    
        }
        catch (err){
            setError(err instanceof Error ? err.message: "Something is wrong");
        }
        finally{
            setIsLoading(false);
        }
    }

    return(
        <nav className="h-[20%] bg-orange-400 flex items-stretch justify-between">
            Navbar

            <div>
                <button onClick={handleLogout} className="p-2 bg-blue-400">
                    Logout
                </button>
                <button onClick={handleLogoutAll}>
                    Logout all
                </button>
            </div>
        </nav>
    )
}
export default NavBar