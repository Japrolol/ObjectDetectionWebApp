import MatrixBackground from "../components/background_matrix.tsx";
import LoginModal from "../components/LoginModal.tsx";

const Home = () => {
    return (
        <div>
            <h1 className={"header-text"} style={{textAlign: "center"}}>TIMECUE AI CLASSIFIER</h1>
            <MatrixBackground />
            <LoginModal />

        </div>
    )
}
export default Home;