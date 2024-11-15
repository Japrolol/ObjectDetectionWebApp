import UserHero from "./UserHero.tsx";
import UserData from "./UserData.tsx";

const User = () => {
    return (
        <div>
            <div className={"body-content"}>
                <UserHero/>
            </div>
            <UserData/>
        </div>
    )
}
export default User;