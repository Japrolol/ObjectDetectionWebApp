import React, {useEffect, useState} from 'react';
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { io } from 'socket.io-client';
import ImageModal from "./ImageModal.tsx";



const UploadForm = () => {
    const [file, setFile] = useState<File | null>(null);
    const [url, setUrl] = useState<string>('');
    const [currentPart, setCurrentPart] = useState<number>(-1);
    const [showImages, setShowImages] = useState<boolean>(false);
    const shown = currentPart >= 0;
    const [id, setId] = useState<string>('');
    useEffect(() => {
        const socket = io("http://localhost:8000");
        socket.on('progress', (data) => {
            console.log(data.stage);
            setCurrentPart(parseInt(data.stage));
        });
    }, []);


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
            setUrl('');
        }
    };

    const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUrl(event.target.value);
        setFile(null);
    };

    const sendData = async () => {
    if (file) {
        const form = new FormData();
        form.append("file", file);
        form.append("uuid", uuidv4());
        setCurrentPart(1)
        await axios.post(import.meta.env.VITE_API_URL + "/detect", form, {
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then((response) => {
            if (response.status === 200) {
                setCurrentPart(4);
                setId(form.get("uuid") as string);
                console.log(id)
            }
        }).catch((error) => {
            console.log(error);
            setCurrentPart(0)
        });

    } else if (url) {
        const data = {
            url: url,
            uuid: uuidv4()
        };

        setCurrentPart(1);
        await axios.post(import.meta.env.VITE_API_URL + "/detect", data, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            if (response.status === 200) {
                setCurrentPart(4);
                setId(data.uuid);
                console.log(id)
            }

        }).catch((error) => {
            console.log(error);
            setCurrentPart(0)
        });
    }
};

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await sendData();
    };

    return (
        <div className={"upload-form inputText"}>
            <form method="post" encType="multipart/form-data" onSubmit={handleSubmit}>
                <input
                    type="file"
                    className={"image-upload"}
                    id="file"
                    name="file"
                    accept="image/*"
                    onChange={handleFileChange}
                />
                <label htmlFor="file">{file === null ? "UPLOAD IMAGE" : "IMAGE UPLOADED"}</label>
                <input
                    type="url"
                    id="url"
                    className={"url-upload inputText"}
                    name={"url"}
                    placeholder={"ENTER URL:"}
                    value={url}
                    onChange={handleUrlChange}
                />
                <button type="submit" className={"inputText"}>SUBMIT</button>
            </form>
            {shown &&
                <div>
                        <div className="loading-bar">
                            <div className={`part ${currentPart >= 1 ? "active" : ""}`} id="part1"></div>
                            <div className={`part ${currentPart >= 2 ? "active" : ""}`} id="part2"></div>
                            <div className={`part ${currentPart >= 3 ? "active" : ""}`} id="part3"></div>
                            <div className={`part last ${currentPart >= 4 ? "active" : ""}`} id="part4"></div>
                        </div>
                    {currentPart === 1 &&
                        <div className={"loading-text"}>
                            <p>Uploading File..</p>
                        </div>
                    }
                    {currentPart === 2 &&
                        <div className={"loading-text"}>
                            <p>Processing Image..</p>
                        </div>
                    }
                    {currentPart === 3 &&
                        <div className={"loading-text"}>
                            <p>Identifying Objects..</p>
                        </div>
                    }
                    {currentPart === 4 &&
                        <div className={"loading-text"}>
                            <p>Rendering Results..</p>
                        </div>
                    }
                     {currentPart === 4 &&
                        <div>
                            <button type="submit" onClick={()=>setShowImages(true)} className={"inputText images-btn"}>SHOW IMAGES</button>
                        </div>
                    }
                    {currentPart === 0 &&
                        <div className={"loading-text"}>
                            <p>Failed to process image. Please try again.</p>
                        </div>
                    }

                </div>
            }
            {showImages &&
                <ImageModal id={id} setView={setShowImages} />
            }

        </div>
    );
}

export default UploadForm;