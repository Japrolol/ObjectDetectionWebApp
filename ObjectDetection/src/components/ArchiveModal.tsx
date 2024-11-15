import React, { useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import axios from 'axios';
import ImageModal from "./ImageModal.tsx";

interface Props {
    setView: (view: boolean) => void;
}

const ArchiveModal: React.FC<Props> = ({ setView }) => {
    const [photos, setPhotos] = useState<{ path: string, id: string }[]>([]);
    const [childView, setChildView] = useState<boolean>(false);
    const [selectedId, setSelectedId] = useState<string>('');

    const retrievePhotos = () => {
        axios.get(`${import.meta.env.VITE_API_URL}/get_images`, { withCredentials: true })
            .then(response => {
                console.log('Success:', response.data);
                setPhotos(response.data.files || []);
            })
            .catch(error => {
                console.error('Error:', error);
                setPhotos([]);
            });
    };

    const displayImage = (id: string) => {
        setChildView(true);
        setSelectedId(id);
    };

    useEffect(() => {
        retrievePhotos();
    }, []);

    return (
        <div>
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-expect-error */}
        <Draggable handle=".archive-handle" defaultPosition={{ x: window.innerWidth / 2 - window.innerWidth / 1.3, y: window.innerHeight / 2 - window.innerHeight / 2 }}>
            <div className="archive-modal">
                <div className="top-line archive-handle">
                    <i className="bx bx-x-circle body-font pointer" onClick={() => setView(false)}></i>
                </div>
                <div className="archive-grid">
                    {photos.map((photo, index) => (
                        <div className="grid-item" key={index}>
                            <img onClick={() => displayImage(photo.id)}
                                 src={`${import.meta.env.VITE_API_URL}/get_thumbnail/` + photo.path} alt={photo.path} className={"img-in-grid"}/>
                        </div>
                    ))}

                </div>
            </div>
        </Draggable>
            {childView && <ImageModal id={selectedId} setView={setChildView} />}
        </div>
    );
};

export default ArchiveModal;