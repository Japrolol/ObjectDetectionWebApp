import { useState, useEffect } from "react";
import Draggable from "react-draggable";
import axios from "axios";
import DisplayBigImage from "./displayBigImage.tsx";
interface Props {
    id: string;
    setView: (view: boolean) => void;
}
const ImageModal = ({ id, setView }: Props) => {
    const [source, setSource] = useState<string>("");
    const [childView, setChildView] = useState<boolean>(false);
    const [imagePair, setImagePair] = useState({ before_img_url: "", after_img_url: "", date_uploaded: "", avg_score: 0, objects_identified: 0, filename: ""});

    const displayImage = (photo_path: string) => {
        setChildView(true);
        setSource(photo_path);
    }

    useEffect(() => {
        const fetchImagePair = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/get_image_pair/${id}`, { withCredentials: true });
                setImagePair(response.data);
            } catch (error) {
                console.error("Error fetching image pair:", error);
            }
        };

        fetchImagePair();
    }, [id]);

    return (
        <div>
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-expect-error */}
        <Draggable handle=".handle" defaultPosition={{ x: window.innerWidth / 2 - window.innerWidth / 1.3, y: window.innerHeight / 2 - window.innerHeight / 2 }}>
            <div className="archive-modal">
                <div className="top-line handle">
                    <i className="bx bx-x-circle body-font pointer" onClick={() => setView(false)}></i>
                </div>
                <div className="image-grid">
                    <div className="grid-item">
                        <img src={imagePair.before_img_url} onClick={()=>displayImage(imagePair.before_img_url)} alt="Before" className="img-in-grid" />
                    </div>
                    <div className="grid-item">
                        <img src={imagePair.after_img_url} onClick={()=>displayImage(imagePair.after_img_url)} alt="After" className="img-in-grid" />
                    </div>
                    <p className={"inputText span-2"}>
                        Date Uploaded: {imagePair.date_uploaded}<br />
                        Average Score: {imagePair.avg_score}%<br />
                        Objects Identified: {imagePair.objects_identified} <br/>
                        Filename: {imagePair.filename}
                    </p>
                </div>
            </div>
        </Draggable>
            {childView && <DisplayBigImage setView={setChildView} imagePath={source} />}
        </div>
    );
};

export default ImageModal;