import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import Home from "./pages/Home.tsx";
import Register from "./pages/Register.tsx";
import LoggedIn from "./pages/logged_in.tsx";
import Protected from "./components/auth/protected.tsx";


function App() {
  return (
      <BrowserRouter>
        <Routes>
            <Route path={"/"} element={<Home />} />
            <Route path={"/initiate"} element={<Register />} />
            <Route path={"/archive"} element={<Protected element={<LoggedIn/>}/>} />
            <Route path={"*"} element={<Navigate to={"/"}/>}/>
        </Routes>
      </BrowserRouter>
  )
}

export default App
