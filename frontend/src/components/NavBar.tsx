import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return(
        <nav className='navbar navbar-expand navbar-dark bg-dark px-3'>
            <Link className='navbar-brand' to="/">CSTM</Link>
            <div className='ms-auto d-flex align-items-center gap-3'>
                {user ? (
                    <>
                    <span className='text-light small'>
                        {user.email}
                        {user.roles.length > 0 && ` (${user.roles.join(' ')})`}
                    </span>
                    <button className='btn btn-outline-light btn-sm' onClick={handleLogout}>
                        Logout
                    </button>
                    </>
                ) : (
                <>
                <Link className='text-light' to='/login'>Login</Link>
                <Link className='text-light' to='/register'>Register</Link>
                </>
                )}
            </div>
        </nav>
    );
}