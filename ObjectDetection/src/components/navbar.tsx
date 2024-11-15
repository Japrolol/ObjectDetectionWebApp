interface Props {
    setActive: (active: number) => void;
    active: number;
}
const Navbar = ({setActive, active}: Props) => {

    return (
        <nav className={"navbar"}>
            <div className={"usable-navbar"}>
                <img src={"timecue_hacker_logo.png"} alt={"logo"} className={"logo"}/>
                <a onClick={()=>setActive(0)} className={`navbar-item ml-auto inputText ${active === 0 && "text-active" }`} data-text={"archive"}>archive</a>
                <a onClick={()=>setActive(1)} className={`navbar-item inputText ${active === 1 && "text-active"}`} data-text={"upload"}>upload</a>
                <a onClick={()=>setActive(2)} className={`navbar-item inputText ${active === 2 && "text-active"}`} data-text={"user"}>user</a>
            </div>
        </nav>
    )
}
export default Navbar;