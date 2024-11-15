const UserHero = () => {
    return (
        <div className="hero">
            <div className={"hero-title inputText"}>
                <p><span className={"b"}>CODENAME:</span> SHADOW IDENTITY</p>
                <p><span className={"b"}>ACCESS LEVEL:</span> PERSONAL. For the user's eyes only.</p>
            </div>
            <div className={"hero-grid inputText"}>
                <div className={"grid-item"}>
                    <span className={"b"}>Mission:</span>
                    <p>Securely store and manage each operative’s core identity and preferences.</p>
                    <br/>
                    <span className={"b"}>Overview: </span>
                    <p><span className={"b"}>SHADOW IDENTITY</span> is the core of personal data management, a vault for each user’s essential information. This is where aliases, encrypted credentials, and custom settings live, enabling personalized experiences and secure access.</p>
                </div>
                <div className={"grid-item"}>
                    <span className={"b"}>Features:</span>
                    <ul>
                        <li><span className={"b"}>Profile Core: </span>
                            Stores username, encrypted passkeys, contact information, and login timestamps.
                        </li>
                        <br/>
                        <li><span className={"b"}>Activity Summary: </span>Personalized activity history, including uploaded images and recent analyses.
                        </li>
                        <br/>
                        <li><span className={"b"}>Security: </span>Layered encryption and access control, ensuring the user’s identity remains in the shadows.
                        </li>
                    </ul>
                </div>
            </div>
            <br/><br/>
            <span className={"b inputText"}>SHADOW IDENTITY: Secure. Personalize. Operate under the radar.</span>
        </div>
    )
}
export default UserHero;