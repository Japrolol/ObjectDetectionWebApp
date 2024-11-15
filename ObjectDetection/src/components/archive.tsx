import Hero from "./Hero.tsx";
import ArchiveContainer from "./archive-container.tsx";
const Archive = () => {
    return (
        <div>
            <div className={"body-content"}>
                <Hero />
            </div>
            <ArchiveContainer />
        </div>
    )
}
export default Archive;