import { Link, useParams } from "react-router";

function TicketDetailsPage() {
    const { id } = useParams<{id: string}>();

    return(
        <section className="page" aria-labelledby="ticket-details-heading">
            <header className="page-header">
                <div>
                    <p className="eyebrow">Ticket details</p>
                    <h1 id="ticket-details-heading">
                        Ticket {id ?? 'unknown'}
                    </h1>
                    <p className="page-header__description">
                        Ticket details and comments will be implemented in Stage 6.
                    </p>
                </div>
            </header>

            <div className="content-card">
                <h2>Details placeholder</h2>

                <dl className="details-list">
                    <div className="details-list__item">
                        <dt>Route parameter</dt>
                        <dd>{id ?? 'Missing ticket ID'}</dd>
                    </div>

                    <div className="details-list__item">
                        <dt>Data source</dt>
                        <dd>Not connected</dd>
                    </div>

                    <div className="details-list__item">
                        <dt>Comments</dt>
                        <dd>Not implemented</dd>
                    </div>
                </dl>

                <Link className="button button--secondary" to='/tickets'>
                    Back to tickets
                </Link>
            </div>
        </section>
    );
}

export default TicketDetailsPage;