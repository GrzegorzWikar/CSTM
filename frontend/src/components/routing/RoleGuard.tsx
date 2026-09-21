import type { PropsWithChildren } from "react";
import type { UserRole } from "../../types";
import { useAuth } from "../../auth/useAuth";
import { Navigate } from "react-router";

interface RoleGuardProps extends PropsWithChildren{
    allowedRoles: UserRole[];
    redirectTo?: string;
}

function RoleGuard({ allowedRoles, redirectTo = '/tickets', children}: RoleGuardProps) {
    const { user } = useAuth();

    if (!user || !allowedRoles.includes(user.role)){
        return <Navigate to={redirectTo} replace />
    }

    return children;
}

export default RoleGuard;