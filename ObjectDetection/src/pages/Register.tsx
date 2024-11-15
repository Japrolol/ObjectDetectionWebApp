import MatrixBackground from "../components/background_matrix.tsx";
import RegisterModal from "../components/RegisterModal.tsx";

const Register = () => {
    return (
        <div>
            <h1 className={"header-text"} style={{textAlign: "center"}}>TIMECUE AI CLASSIFIER</h1>
            <MatrixBackground />
            <RegisterModal />
        </div>
    );
}
export default Register;