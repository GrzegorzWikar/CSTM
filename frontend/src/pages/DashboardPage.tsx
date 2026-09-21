function DashboardPage() {
    return (
        <section className="page" aria-labelledby="dashboard-heading">
            <header className="page-header">
                <div>
                    <p className="eyebrow">Overview</p>
                    <h1 id='dashboard-heading'>Dashboard</h1>
                    <p className="page-header__description">
                        Ticket statistics will be implemented in Stage 7.
                    </p>
                </div>
            </header>

            <div className="placeholder-grid" aria-label="Dashboard placeholders">
                <article className="placeholder-card">
                    <span className="placeholder-card__label">Total tickets</span>
                    <strong className="placeholder-card__value">Not loaded</strong>
                </article>

                <article className="placeholder-card">
                    <span className="placeholder-card__label">Open tickets</span>
                    <strong className="placeholder-card__value">Not loaded</strong>
                </article>

                <article className="placeholder-card">
                    <span className="placeholder-card__label">Resolved tickets</span>
                    <strong className="placeholder-card__value">Not loaded</strong>
                </article>
            </div>

            <div className="content-card">
                <h2>Stage 1 placeholder</h2>
                <p>
                    This area will later contain ticket summaries  gruped by status and severity.
                </p>
            </div>
        </section>
    );
}

export default DashboardPage;