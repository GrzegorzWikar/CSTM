import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../auth/useAuth";

function PublicOnlyRoute() {
    const { isAuthenticated, isInitializing } = useAuth();

    if (isInitializing){
        return(
            <main className="route-loading" aria-live="polite" aria-busy="true">
                <div className="route-loading__spinner" aria-hidden='true' />
                <p>Checking your session...</p>
            </main>
        );
    }

    if (isAuthenticated){
        return <Navigate to="/tickets" replace />
    }

    return <Outlet />
}

export default PublicOnlyRoute;