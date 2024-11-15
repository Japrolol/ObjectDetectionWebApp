import UploadHero from "./UploadHero.tsx";
import UploadForm from "./UploadForm.tsx";

const Upload = () => {
    return (
        <div>
            <div className={"body-content"}>
                <UploadHero />
            </div>
            <UploadForm />
        </div>
    )
}
export default Upload;