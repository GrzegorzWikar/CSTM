import { Outlet } from "react-router";
import Navbar from '../components/navigation/Navbar';
import Sidebar from '../components/navigation/Sidebar';

function AppLayout(){
    return(
        <div className="app-shell">
            <Navbar />

            <div className="app-body">
                <Sidebar />

                <main className="main-content" id="main-content" tabIndex={-1}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AppLayout;