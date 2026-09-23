import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

export default function Layout() {
    return(
        <>
            <NavBar />
            <div className="container mt-4">
                <Outlet />
            </div>
        </>
    );
}