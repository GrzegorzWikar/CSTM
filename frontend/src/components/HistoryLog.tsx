import { useEffect, useState } from 'react';
import { getTicketHistory } from '../api/HistoryApi';
import type { TicketHistoryResponse } from '../types/History';

interface HistoryLogProps {
  ticketId: number;
}

export default function HistoryLog({ ticketId }: HistoryLogProps) {
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
        console.error('Błąd pobierania historii ticketu:', err);
        setError('Nie udało się pobrać historii zmian.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [ticketId]);

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="h5 mb-3">Historia zmian</h2>
        {isLoading ? (
          <p>Ładowanie...</p>
        ) : error ? (
          <div className="alert alert-danger py-2">{error}</div>
        ) : history.length === 0 ? (
          <p className="text-muted">Brak historii zmian.</p>
        ) : (
          <ul className="list-group list-group-flush">
            {history.map((entry) => (
              <li key={entry.id} className="list-group-item px-0">
                <small className="text-muted d-block">
                  {new Date(entry.changedAt).toLocaleString('pl-PL')}
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