import NavBar from "../components/navbar"
import MultiFileUpload from "../components/uploadContainer"

const UpLoadPages=()=>{
    return(
        <div>
            <NavBar/>
                <div className="flex h-screen items-center justify-center">
                    <MultiFileUpload/>
                </div>
        </div>
    )
}
export default UpLoadPages