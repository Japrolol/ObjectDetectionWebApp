interface Props {
    setView: (view: boolean) => void;
    imagePath: string;
}
const DisplayBigImage = ({setView, imagePath}: Props) => {
    return (
        <div className="big-image">
            <div className="top-line">
                <i className="bx bx-x-circle body-font pointer" onClick={() => setView(false)}></i>
            </div>
            <div className={"image-area"}>
                <img src={imagePath} alt="Big"  className={"big-img"}/>
            </div>
        </div>
    );
}
export default DisplayBigImage;