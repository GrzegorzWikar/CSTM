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

const PROPERTY_LABELS: Record<string, string> = {
  ServiceName: 'Service',
  Severity: 'Severity',
  Status: 'Status',
  AssignedToUserId: 'Assigned to',
  Comment: 'Comment'
}

interface ParsedChange{
  property: string,
  value: string
}

function parseChange(text: string): ParsedChange | null {
  const match = /^([A-Za-z]+): ?([\s\S]*)$/.exec(text);
  return match ? { property: match[1], value: match[2]} : null;
}

function formatValue(property: string, value: string, users: UserSummary[] | null): string {
  if (property === 'AssigneToUserId') {
    return value ?  resolveUserEmail(users, value) : 'Unassigned';
  }
  if(property === 'Severity' || property === 'Status'){
    return value.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
  }
  return value;
}

function describeChange(entry: TicketHistoryResponse, users: UserSummary[] | null): string{
  const oldChange = parseChange(entry.oldStatus);
  const newChange = parseChange(entry.newStatus);

  if (!oldChange || !newChange || oldChange.property !== newChange.property){
    return `${entry.oldStatus} -> ${entry.newStatus}`;
  }

  const property = newChange.property;

  if (property === 'Comment'){
    return oldChange.value === ''
      ? `Comment added: "${newChange.value}"`
      : `Comment edited: "${oldChange.value}" -> "${newChange.value}`;
  }

  const label = PROPERTY_LABELS[property] ?? property;
  return `${label}: ${formatValue(property, oldChange.value, users)} -> ${formatValue(property, newChange.value, users)}`;
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
                  {resolveUserEmail(users, entry.changeByUserId)} •{' '}
                  {new Date(entry.changeAt).toLocaleString('en-GB')}
                </small>
                <div className="text-break">{describeChange(entry, users)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}