import { useEffect, useState } from "react";
import { getTicketHistory } from "../api/HistoryApi";
import type { TicketHistoryResponse } from "../types/History";

interface HistoryLogProps {
    ticketId: number;
}

export default function HistoryLog({ticketId}: HistoryLogProps){
    const [history, setHistory] = useState<TicketHistoryResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try{
                const data = await getTicketHistory(ticketId);
                setHistory(data);
            }finally{
                setIsLoading(false);
            }
        }
        load();
    }, [ticketId]);

    return (
        <div className="card">
            <div className="card-body">
                <h2 className="h5 mb-3">Change History</h2>
                {isLoading ? (
                    <p>Loading...</p>
                ): history.length === 0 ? (
                    <p className="text-muted">No history changes</p>
                ) : (
                    <ul className="list-group list-group-flush">
                        {history.map((entry) => (
                            <li key={entry.id} className="list-group-item px-0">
                                <small className="text-muted d-block">
                                    {new Date(entry.changedAt).toLocaleString('en-GB')}
                                </small>
                                <div>
                                    {entry.oldStatus} → {entry.newStatus}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}