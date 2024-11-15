import {useNavigate} from "react-router-dom";

import Auth from "./auth/auth.tsx";
import React, {useState} from "react";

const LoginModal = () => {
    const navigate = useNavigate();
    const [access, setAccess] = useState(false);
    const [formData, setFormData] = useState({username: "", password: ""});
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    }
    const handleLogin = async () => {
        try {
            await Auth.Login(formData.username, formData.password);
            setAccess(true);
            setTimeout(()=>navigate("/archive"), 2000);
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <div className={"login-modal"}>
            <h1 className={"subheader-text"} style={{textAlign: "center"}}>ACCESS THE SYSTEM</h1>
            <div className={"fun-data"}>
                <p className={"body-font"}>255.255.255.0: {!access ? "blocked" : "clear"}</p>
                <p className={"body-font"}>firewall: {!access ? "blocked" : "clear"}</p>
                <p className={"body-font dim"}>{access ? "ACCESS GRANTED" : "ACCESS DENIED"}</p>
            </div>
            <div className={"login-form"}>
                <div>
                    <label className={"inputText"} htmlFor={"username"}>user: </label>
                    <input type="text" className={"body-font"} onChange={handleChange} name="username" id={"username"} />
                </div>
                <div>
                    <label className={"inputText"} htmlFor={"password"}>password: </label>
                    <input type="password" onChange={handleChange} className={"body-font"} name={"password"}/>
                </div>
            </div>
            <div className={"buttons"}>
                <button onClick={()=>navigate("/initiate")} className={"body-font"}>SIGN-UP</button>
                <button  onClick={handleLogin} className={"body-font"}>SIGN-IN</button>
            </div>
        </div>
    );
}
export default LoginModal;