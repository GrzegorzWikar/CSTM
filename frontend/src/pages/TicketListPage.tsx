import { useEffect, useState, type SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import { getTickets } from "../api/TicketApi";
import type { TicketFilterParameters, TicketResponse } from "../types/Ticket";
import type { PagedResult } from "../types/Common";
import { StatusLabels, SeverityLabels, type Status, type Severity } from "../types/Enums";
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from "../components/SeverityBadge";
import Pagination from "../components/Pagination";

const PAGE_SIZE = 10;

export default function TicketListPage() {
    const [filters, setFilters] = useState<TicketFilterParameters>({
        page: 1,
        pageCount: PAGE_SIZE
    });

    const [draftTitle, setDraftTitle] = useState('');
    const [draftServiceName, setDraftServiceName] = useState('');
    const [draftStatus, setDraftStatus] = useState('');
    const [draftSeverity, setDraftSeverity] = useState('');

    const [result, setResult] = useState<PagedResult<TicketResponse> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isCancelled = false;

        const fetchTickets = async () => {
            setIsLoading(true);
            setError(null);
            try{
                const data = await getTickets(filters);
                if (!isCancelled) setResult(data);
            }catch{
                if (!isCancelled) setError('Failed to fetch the tickets.');
            }finally{
                if (!isCancelled) setIsLoading(false);
            }
        };

        fetchTickets();

        return () => {
            isCancelled = true;
        };
    }, [filters]);

    const applyFilters = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFilters({
            page: 1,
            pageCount: PAGE_SIZE,
            title: draftTitle || undefined,
            serviceName: draftServiceName || undefined,
            status: draftStatus === '' ? undefined : (Number(draftStatus) as Status),
            severity: draftSeverity === '' ? undefined : (Number(draftSeverity) as Severity)
        });
    }

    const clearFilters = () => {
        setDraftTitle('');
        setDraftServiceName('');
        setDraftStatus('');
        setDraftSeverity('');
        setFilters({page: 1, pageCount: PAGE_SIZE});
    }

    const goToPage = (page: number) => {
        setFilters((prev) => ({...prev, page}));
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="h3 mb-3">Incidents</h1>
                <Link to='/tickets/new' className="btn btn-primary btn-sm">
                    New Ticket
                </Link>
            </div>
            <form className="row g-2 mb-3" onSubmit={applyFilters}>
                <div className="col-md-3">
                    <input type="text" className="form-control" placeholder="Title" value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)}/>
                </div>
                <div className="col-md-3">
                    <input type="text" className="form-control" placeholder="Service Name" value={draftServiceName} onChange={(e) => setDraftServiceName(e.target.value)}/>
                </div>
                <div className="col-md-2">
                    <select className="form-select" value={draftStatus} onChange={(e) => setDraftStatus(e.target.value)}>
                        <option value="">All Status</option>
                        {Object.entries(StatusLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-md-2">
                    <select className="form-select" value={draftSeverity} onChange={(e) => setDraftSeverity(e.target.value)}>
                        <option value=''>All Severity</option>
                        {Object.entries(SeverityLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-md-2 d-flex gap-2">
                    <button type="submit" className="btn btn-primary flex-fill">
                        Search
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={clearFilters}>
                        Clear
                    </button>
                </div>
            </form>
            {error && <div className="alert alert-danger">{error}</div>}
            {isLoading ? (<p>Loading...</p>) : (
                <>
                    <table className="table table-hover align-middle">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Service Name</th>
                                <th>Severity</th>
                                <th>Status</th>
                                <th>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result?.items.length ? (
                                result.items.map((ticket) => (
                                    <tr key={ticket.id}>
                                        <td>
                                            <Link to={`/tickets/${ticket.id}`}>{ticket.title}</Link>
                                        </td>
                                        <td>{ticket.serviceName}</td>
                                        <td>
                                            <SeverityBadge severity={ticket.severity}/>
                                        </td>
                                        <td>
                                            <StatusBadge status={ticket.status}/>
                                        </td>
                                        <td>{new Date(ticket.createdAt).toLocaleString('en-GB')}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center text-muted">
                                        No incidents meeting the criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {result && (<Pagination page={result.page} totalPages={result.totalPages} onPageChange={goToPage}/>)}
                </>
            )}
        </div>
    );
}