const UploadHero = () => {
    return (
        <div className={"hero"}>
            <div className={"hero-grid inputText mt-0"}>
                <div className={"grid-item"}>
                    <p><span className={"b"}>CODENAME:</span> SENTRY</p>
                    <br/>
                    <p>Feed SENTRY either a direct image file or a covert link to a visual target. With advanced neural
                        reconnaissance, it slices through pixels and decodes hidden objects within milliseconds.</p>
                    <br/><br/>
                    <span className={"b inputText"}>SENTRY: Watch. Detect. Decode.</span>
                </div>
                <div className={"grid-item im"}>
                <img src={"hacker.jpeg"} alt={"hacker"} className={"hero-image"}/>
                </div>
            </div>


        </div>
    )
}
export default UploadHero