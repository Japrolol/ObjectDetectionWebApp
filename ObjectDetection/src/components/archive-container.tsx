import {useState} from "react";
import ArchiveModal from "./ArchiveModal.tsx";

const ArchiveContainer = () => {
    const [view, setView] = useState(false);
    return (
        <div className={"archive-container"}>
            <button className={"archive-button inputText"} onClick={()=>setView(true)}>VIEW ARCHIVE</button>

            {view &&
                <ArchiveModal setView={setView}/>
            }
        </div>
    );
}
export default ArchiveContainer;