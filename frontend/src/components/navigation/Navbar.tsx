import { Link } from 'react-router';

function Navbar() {
    return(
        <header className='navbar'>
            <a className='skip-link' href='#main-content'>
                Skip to main content
            </a>

            <Link className='navbar__brand' to="/tickets">
                <span className='navbar__brand-mark' aria-hidden="true">
                    CS
                </span>

                <span className='navbar__brand-text'>
                    Cloud Support Ticket Manager
                </span>
            </Link>

            <div className='navbar__user' arial-label="Current user placeholder">
                <span className='navbar__user-avatar' aria-hidden='true'>
                    U
                </span>

                <span className='navbar__user-details'>
                    <span className='navbar__user-name'>Demo User</span>
                    <span className='navbar__user-role'>Authentication pending</span>
                </span>
            </div>
        </header>
    );
}

export default Navbar;