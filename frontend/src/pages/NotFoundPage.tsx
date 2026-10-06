import { Link } from 'react-router-dom';

export default function NotFoundPage() {
    return(
        <div className='text-center mt-5'>
            <h1 className='display-4'>404</h1>
            <p className='text-muted mb-4'>Page not exist</p>
            <Link to='/' className='btn btn-primary'>
                Back to Main Page
            </Link>
        </div>
    )
}