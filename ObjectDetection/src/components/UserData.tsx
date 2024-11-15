import Auth from "./auth/auth.tsx";
import { useNavigate } from "react-router-dom";
import useGetUserData from "./data/GetUserData.tsx";
import MatrixBackground from "./background_matrix.tsx";

const UserData = () => {
    const navigate = useNavigate();
    const data = useGetUserData();

    if (!data) {
        return <MatrixBackground />;
    }
    const accessLevel = data.access_level || 0;
    const levels: { [key: number]: string } = {
        1: "Level 1 - Specter",
        2: "Level 2 - Warden",
        3: "Level 3 - Operative",
        4: "Level 4 - Sovereign",
        5: "Level 5 - True Zero"
    };

    const { username, id, email, account_created, last_image, last_login, max_boxes } = data;
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const max_boxes = parseInt(event.target.value);
        if (max_boxes) {
            Auth.UpdateMaxBoxes(max_boxes);
        }
    }
        const handleLogout = async () => {
            try {
                await Auth.Logout();
                navigate("/");
            } catch (error) {
                console.log(error);
            }
        };

        return (
            <div className={"user-data"}>
                <ul className={"inputText"}>
                    <li><span className={"b"}>ALIAS:</span> {username}</li>
                    <li><span className={"b"}>UNIQUE ID:</span> #{id}</li>
                    <li><span className={"b"}>CONTACT:</span> {email}</li>
                    <li><span className={"b"}>ACCESS LEVEL:</span> {levels[accessLevel]}</li>
                    <li><span
                        className={"b"}>ACCOUNT CREATED:</span> {new Date(account_created).toLocaleString('en-US', {
                        timeZone: 'UTC',
                        hour12: false
                    })} UTC
                    </li>
                    <li><span
                        className={"b"}>RECENT ANALYSIS:</span> {last_image?.objects_identified ? `${last_image.objects_identified} objects identified` : "No recent scans"}
                        , {last_image?.avg_score ? `${last_image.avg_score}%` : ""}
                    </li>
                    <li>
                    <span
                        className={"b"}>LAST UPLOAD:</span> {last_image?.filename ? last_image.filename : "No images"} @ {last_image?.date_uploaded ? new Date(last_image.date_uploaded).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false,
                        timeZone: 'UTC'
                    }) : "N/A"} UTC
                    </li>
                    <li><span className={"b"}>LAST LOGIN:</span> {new Date(last_login).toLocaleString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        timeZone: 'UTC',
                        hour12: false
                    })} @ {new Date(last_login).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false,
                        timeZone: 'UTC'
                    })} UTC
                    </li>
                    <li><span className={"b"}>MAX BOXES:</span>&nbsp;<input type={"number"} onBlur={handleChange} defaultValue={max_boxes}
                                                                            className={"max_boxes_input inputText"}
                                                                            pattern={"[0-9]*"} inputMode={"numeric"}/>
                    </li>
                    <button onClick={handleLogout} className={"logout-button inputText"}>
                        LOGOUT
                    </button>
                </ul>
            </div>

        );
}

export default UserData;