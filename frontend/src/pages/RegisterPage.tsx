import { useState, type SyntheticEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { register } from "../api/AuthApi";

interface ValidationProblemResponse {
    errors?: Record<string, string[]>;
    title?: string;
}

export default function RegisterPage(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if(password !== confirmPassword) {
            setError("Passwords not match.");
            return;
        }

        setIsSubmitting(true);
        try{
            await register({email, password});
            navigate('/login');
        }catch (err){
            if (axios.isAxiosError<ValidationProblemResponse>(err)){
                const data = err.response?.data;
                const message = data?.errors ? Object.values(data.errors).flat().join(' ') : data?.title;
                setError(message || 'Register was faild.');
            }else{
                setError('Register was faild.')
            }
        }finally{
            setIsSubmitting(false);
        }
    };

    return(
        <div className="d-flex justify-content-center mt-5">
            <div className="card p-4" style={{minWidth: 350}}>
                <h1 className="h4 mb-3">Register</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">E-mail</label>
                        <input id="email" type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input id="password" type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                        <input id="confirmPassword" type="password" className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required/>
                    </div>
                    {error && <div className="alert alert-danger py-2">{error}</div>}
                    <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
                        {isSubmitting ? 'Registering...' : "Register!"}
                    </button>
                </form>
                <p className="mt-3 mb-0 text-center">
                    Do you have account?<Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}