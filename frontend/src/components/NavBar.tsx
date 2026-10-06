import { Navbar, Nav, Container } from 'react-bootstrap';
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
        <Navbar bg='dark' variant='dark' expand='lg' className='px-3'>
            <Container fluid>
                <Navbar.Brand as={Link} to='/'>
                    CSTM
                </Navbar.Brand>
                <Navbar.Toggle aria-controls='main-navbar' />
                <Navbar.Collapse id='main-navbar' className='justify-content-end'>
                    {user ? (
                        <div className='d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-2 gap-lg-3 mt-3 mt-lg-0'>
                            <span className='text-light small'>
                                {user.email}
                                {user.roles.length > 0 && ` (${user.roles.join(', ')})`}
                            </span>
                            <button className='btn btn-outline-light btn-sm' onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Nav className='mt-3 mt-lg-0'>
                            <Nav.Link as={Link} to='/login' className='text-light'>
                                Login
                            </Nav.Link>
                            <Nav.Link as={Link} to="/register" className='text-light'>
                                Register
                            </Nav.Link>
                        </Nav>
                    )}
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}