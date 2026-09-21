import { Link } from 'react-router';

function NewTicketPage() {
    return (
        <section className='page' aria-labelledby='new-ticket-heading'>
            <header className='page-header'>
                <div>
                    <p className='eyebrow'>Support request</p>
                    <h1 id='new-ticket-heading'>Create ticket</h1>
                    <p className='page-header__description'>
                        The validated ticket form woll be implemented in Stage 5.
                    </p>
                </div>
            </header>

            <div className='content-card'>
                <h2>Form placeholder</h2>

                <div className='placeholder-panel'>
                    <p>
                        The future form will contain title, description, Azure service and severity fields.
                    </p>
                </div>

                <Link className='button button--secondary' to='/tickets'>
                    Back to tickets
                </Link>
            </div>
        </section>
    );
}

export default NewTicketPage;