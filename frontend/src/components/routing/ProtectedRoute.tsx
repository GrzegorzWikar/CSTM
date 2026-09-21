import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../auth/useAuth";

function ProtectedRoute(){
    const {isAuthenticated,isInitializing} = useAuth();

    const location = useLocation();

    if (isInitializing){
        return(
            <main className="route-loading" aria-live='polite' aria-busy='true'>
                <div className="route-loading__spinner" arial-hidden='true' />
                <p>Restoring your session...</p>
            </main>
        );
    }

    if (!isAuthenticated) {
        return(
            <Navigate to='/login' replace state={{from: location.pathname}} />
        );
    }

    return <Outlet />
}

export default ProtectedRoute;