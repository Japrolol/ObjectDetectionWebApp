const Hero = () => {
    return (
        <div className="hero">
            <div className={"hero-title inputText"}>
                <p><span className={"b"}>CODENAME:</span> GHOST ARCHIVE</p>
                <p><span className={"b"}>ACCESS LEVEL:</span> CLASSIFIED</p>
            </div>
            <div className={"hero-grid inputText"}>
                <div className={"grid-item"}>
                    <span className={"b"}>Mission:</span>
                    <p>Retrieve every uploaded visual payload from the archives, preserved for analysis.</p>
                    <br/>
                    <span className={"b"}>Overview: </span>
                    <p>GHOST ARCHIVE is a secured hub, hosting every image that’s been fed into the system. Each image file is cataloged with timestamps, origin sources, and detection results, allowing you to review, reanalyze, or purge as needed.</p>
                </div>
                <div className={"grid-item"}>
                    <span className={"b"}>Features:</span>
                    <ul>
                        <li><span className={"b"}>Access: </span>Tap into a chronologically ordered gallery of all intel received.</li><br/>
                        <li><span className={"b"}>Details: </span>Hover for insights, including object detection summaries, coordinates, and confidence metrics.</li><br/>
                        <li><span className={"b"}>Navigation: </span>Toggle between compact and detailed views to streamline recon.</li>
                    </ul>
                </div>
            </div>
            <br/><br/>
            <span className={"b inputText"}>GHOST ARCHIVE: Preserve. Review. Control.</span>
        </div>
    );
}
export default Hero;