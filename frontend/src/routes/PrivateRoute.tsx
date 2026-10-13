import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

interface PrivateRouteProps {
    allowedRoles?: string[];
}

export default function PrivateRoute({ allowedRoles }: PrivateRouteProps) {
    const { user, isLoading, hasRole } = useAuth();

    if (isLoading) {
        return <LoadingSpinner/>
    }

    if(!user){
        return <Navigate to="/login" replace/>;
    }

    if (allowedRoles && !allowedRoles.some(hasRole)){
        return <Navigate to="/" replace />;
    }

    return <Outlet />
}