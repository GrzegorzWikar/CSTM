import { useEffect, useState } from 'react';
import { getTicketHistory } from '../api/HistoryApi';
import type { TicketHistoryResponse } from '../types/History';
import type { UserSummary } from '../types/user';
import { resolveUserEmail } from '../utils/users';
import LoadingSpinner from './LoadingSpinner';
interface HistoryLogProps {
  ticketId: number;
  users: UserSummary[] | null;
}

export default function HistoryLog({ ticketId, users }: HistoryLogProps) {
  const [history, setHistory] = useState<TicketHistoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getTicketHistory(ticketId);
        setHistory(data);
      } catch (err) {
        console.error('Error of fetching Ticket History:', err);
        setError('Unable to fetch Ticket History');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [ticketId]);

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="h5 mb-3">Ticket History</h2>
        {isLoading ? (
          <LoadingSpinner/>
        ) : error ? (
          <div className="alert alert-danger py-2">{error}</div>
        ) : history.length === 0 ? (
          <p className="text-muted">No Ticket History</p>
        ) : (
          <ul className="list-group list-group-flush">
            {history.map((entry) => (
              <li key={entry.id} className="list-group-item px-0">
                <small className="text-muted d-block">
                  {resolveUserEmail(users, entry.changedByUserId)} •{' '}
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