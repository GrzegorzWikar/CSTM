import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface PrivateRouteProps {
    allowedRoles?: string[];
}

export default function PrivateRoute({ allowedRoles }: PrivateRouteProps) {
    const { user, isLoading, hasRole } = useAuth();

    if (isLoading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    if(!user){
        return <Navigate to="/login" replace/>;
    }

    if (allowedRoles && !allowedRoles.some(hasRole)){
        return <Navigate to="/" replace />;
    }

    return <Outlet />
}