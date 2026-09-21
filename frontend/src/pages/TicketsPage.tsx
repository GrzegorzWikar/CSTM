import { Link } from "react-router";

function TicketsPage() {
    return (
        <section className="page" aria-labelledby="tickets-heading">
            <header className="page-header">
                <div>
                    <p className="eyebrow">Support workspace</p>
                    <h1 id="tickets-heading">Tickets</h1>
                    <p className="page-header__description">
                        The ticket table and filters will be implemented in Stage 4.
                    </p>
                </div>

                <Link className="button button--primary" to="/tickets/new">
                    Create ticket
                </Link>
            </header>

            <div className="content-card">
                <h2>Ticket list placeholder</h2>
                <p>
                    This card confirms that ticket route is rendered inside the application layout.
                </p>

                <div className="placeholder-panel">
                    <p>
                        Loading, error, empty state, filters and ticket data are outside the scope of Stage 1.
                    </p>
                </div>

                <Link className="text-link" to="/tickets/demo-ticket-001">
                    Open sample details route
                </Link>
            </div>
        </section>
    );
}

export default TicketsPage;