import MatrixBackground from "../components/background_matrix.tsx";
import Navbar from "../components/navbar.tsx";
import {useState} from "react";
import Archive from "../components/archive.tsx";
import Upload from "../components/upload.tsx";
import User from "../components/User.tsx";

const LoggedIn = () => {
    const [active, setActive] = useState(0);
    return (
        <div>
            <MatrixBackground />
            <Navbar setActive={setActive} active={active}/>
            {active === 0 &&
                <Archive/>
            }
            {active === 1 &&
                <Upload/>
            }
            {active === 2 &&
                <User/>
            }
        </div>
    )
}
export default LoggedIn;