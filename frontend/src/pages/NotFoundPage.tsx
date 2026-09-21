import { Link } from 'react-router';

function NotFoundPage() {
    return(
        <main className='not-found-page'>
            <section className='not-found-card' aria-labelledby='not-found-heading'>
                <p className='not-found-card__code' aria-hidden="true">
                    404
                </p>

                <h1 id='not-found heading'>Page not found</h1>

                <p>
                    The requested address dose not mach any page in Cloud Support Ticket Manager.
                </p>

                <div className='not-found-card__actions'>
                    <Link className='button button-primary' to='tickets'>
                        Go to tickets
                    </Link>

                    <Link className='button button-secondary' to='/login'>
                        Go to sign in
                    </Link>
                </div>
            </section>
        </main>
    );
}

export default NotFoundPage;