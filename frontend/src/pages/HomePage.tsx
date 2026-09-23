import { useAuth } from "../context/AuthContext";

export default function HomePage(){
    const { user } = useAuth();

    return(
        <div>
            <h1 className="h3">Hi {user ? `, ${user.email}` : ''}</h1>
            <p className="text-muted">
                Placeholder Ticket List
            </p>
        </div>
    );
}