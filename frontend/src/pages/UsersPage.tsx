import { useEffect, useState } from "react";
import axios from "axios";
import { assignRole, getUsers } from "../api/userApi";
import { useAuth } from "../context/AuthContext";
import type { UserSummary } from "../types/user";
import LoadingSpinner from "../components/LoadingSpinner";

type Role = 'User' | 'Support' | 'Admin';

const ROLE_BADGE: Record<Role, string> = {
    User: 'bg-secondary',
    Support: 'bg-primary',
    Admin: 'bg-danger',
};

function getHighestRole(roles: string[]): Role{
    if (roles.includes('Admin')) return 'Admin';
    if (roles.includes('Support')) return 'Support';
    return 'User'
}

function getErrorMessage(err: unknown): string {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        if (typeof data === 'string' && data.length > 0) return data;
        if (err.response?.status === 403) return 'You are not allowed to make this change.';
    }
    return 'Failed to change the role.';
}

function getPromotions(actorsIsAdmin: boolean, targetRole: Role): Role[]{
    if (targetRole === 'Admin') return [];
    if (actorsIsAdmin) return targetRole === 'User' ? ['Support', 'Admin'] : ['Admin'];
    return targetRole === 'User' ? ['Support'] : [];
}

interface Feedback {
    type: 'success' | 'danger';
    text: string;
}

export default function UserPage() {
    const { user: currentUser, hasRole } = useAuth();
    const actorsIsAdmin = hasRole('Admin');

    const [users, setUsers] = useState<UserSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [busyUserId, setBusyUserId] = useState<string | null>(null);

    useEffect(() => {
        let isCancelled = false;
        
        const load = async () => {
            try{
                const data = await getUsers();
                if (!isCancelled) setUsers(data);
            } catch {
                if (!isCancelled) setError('Failed to fetch the users.');
            } finally {
                if (!isCancelled) setIsLoading(false);
            }
        };

        load();

        return () => {
            isCancelled = true;
        };

    }, []);

    const handlePromote = async (target: UserSummary, role: Role)=> {
        if (role === 'Admin' && !window.confirm(`Give ${target.email} full Admin rights?`)) return;

        setBusyUserId(target.id);
        setFeedback(null);
        try{
            await assignRole(target.id, role);
            setUsers((prev) => prev.map((u) => (u.id === target.id ? {...u, roles: [role]} : u)));
            setFeedback({
                type: 'success',
                text: `${target.email} is now ${role}. They need to log out and log in again for the change to take effect.`
            });
        }catch(err){
            setFeedback({type: 'danger', text: getErrorMessage(err)});
        }finally{
            setBusyUserId(null);
        }
    };

    return(
        <div>
            <h1 className="h3 mb-3">Users</h1>
            {feedback && <div className={`alert alert-${feedback.type} py-2`}>{feedback.text}</div>}
            {isLoading ? (<LoadingSpinner/>) : error ? (<div className="alert alert-danger py-2">{error}</div>):(
                <div className="table-responsive">
                    <table className="table align-middle">
                        <thead>
                            <tr>
                                <th>E-mail</th>
                                <th>Role</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => {
                                const role = getHighestRole(u.roles);
                                const isSelf = u.id === currentUser?.id;
                                const promotions = isSelf ? [] : getPromotions(actorsIsAdmin, role);

                                return(
                                    <tr key={u.id}>
                                        <td className="text-break">
                                            {u.email}
                                            {isSelf && <span className="text-muted small ms-2">(you)</span>}
                                        </td>
                                        <td>
                                            <span className={`badge ${ROLE_BADGE[role]}`}>{role}</span>
                                        </td>
                                        <td className="text-end">
                                            {promotions.map((target) => (
                                                <button 
                                                    key={target}
                                                    type="button"
                                                    className={`btn btn-sm ms-2 ${target === "Admin" ? 'btn btn-outline-danger' : 'btn-outline-primary'}`}
                                                    disabled={busyUserId !== null}
                                                    onClick={() => handlePromote(u, target)}>
                                                        Promote to {target}
                                                    </button>
                                            ))}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}