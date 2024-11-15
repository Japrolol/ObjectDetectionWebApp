import {useNavigate} from "react-router-dom";
import React, {useState} from "react";
import Auth from "./auth/auth.tsx";

const RegisterModal = () => {
    const navigate = useNavigate();
    const [access, setAccess] = useState(false);
    const [formData, setFormData] = useState({username: "", email: "", password: ""});
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    }
    const handleRegister = async () => {
        try {
            await Auth.Register(formData.username, formData.email, formData.password);
            setAccess(true);

            setTimeout(()=>navigate("/"), 2000);
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <div className={"login-modal"}>
            <h1 className={"subheader-text"} style={{textAlign: "center"}}>INITIATE</h1>
            <div className={"fun-data"}>
                <p className={"body-font"}>255.255.255.0: {!access ? "blocked" : "clear"}</p>
                <p className={"body-font"}>firewall: {!access ? "blocked" : "clear"}</p>
                <p className={"body-font dim"}>{!access ? "ACCESS DENIED" : "ACCESS GRANTED"}</p>
            </div>
            <div className={"login-form"}>
                <div>
                    <label className={"inputText"} htmlFor={"username"}>user: </label>
                    <input type="text" onChange={handleChange} className={"body-font"} name="username" id={"username"} />
                </div>
                <div>
                    <label className={"inputText"} htmlFor={"email"}>email: </label>
                    <input type="email" onChange={handleChange} className={"body-font"} name="email" id={"email"} />
                </div>
                <div>
                    <label className={"inputText"} htmlFor={"password"}>password: </label>
                    <input type="password" onChange={handleChange} className={"body-font"} name={"password"}/>
                </div>
            </div>
            <div className={"buttons"}>
                <button onClick={()=>navigate("/")} className={"body-font"}>SIGN-IN</button>
                <button onClick={handleRegister} className={"body-font"}>SIGN-UP</button>
            </div>
        </div>
    );
}
export default RegisterModal;