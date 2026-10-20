import { useEffect, useState, type SyntheticEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTicketById, updateTicket } from '../api/TicketApi';
import type { TicketResponse, UpdateTicketRequest } from '../types/Ticket';
import { Severity, SeverityLabels, Status, StatusLabels } from '../types/Enums';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';
import CommentsSection from '../components/CommentsSection';
import HistoryLog from '../components/HistoryLog';
import { getUsers } from '../api/userApi';
import type { UserSummary } from '../types/user';
import { resolveUserEmail } from '../utils/users';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function TicketDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const ticketId = Number(id);
  const { hasRole } = useAuth();
  const canManage = hasRole('Support') || hasRole('Admin');

  const [ticket, setTicket] = useState<TicketResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [serviceName, setServiceName] = useState('');
  const [severity, setSeverity] = useState<Severity>(Severity.Sev1);
  const [status, setStatus] = useState<Status>(Status.New);
  const [assignedToUserId, setAssignedToUserId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [users, setUsers] = useState<UserSummary[] | null>(null);
  const [historyVersion, setHistoryVersion] = useState(0);

  const loadTicket = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTicketById(ticketId);
      setTicket(data);
      setServiceName(data.serviceName);
      setSeverity(data.severity);
      setStatus(data.status);
      setAssignedToUserId(data.assignedToUserId ?? '');
    } catch {
      setError('Unable to fetch Ticket (check if Ticket by given Id exist.)');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (Number.isNaN(ticketId)) {
      setError('Wrong Ticket Id.');
      setIsLoading(false);
      return;
    }
    loadTicket();
  }, [ticketId]);

  useEffect(() => {
    if (!canManage) return;
    getUsers()
      .then(setUsers)
      .catch(() => setUsers(null));
  }, [canManage]);

  const handleUpdate = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const payload: UpdateTicketRequest = {
      id: ticketId,
      serviceName,
      severity,
      status,
      assignedToUserId,
    };

    try {
      const updated = await updateTicket(payload);
      setTicket(updated);
      setSaveSuccess(true);
      setHistoryVersion((v) => v + 1);
    } catch {
      setSaveError('Unable to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner/>
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!ticket) return null;

  return (
    <div>
      <Link to="/" className="d-inline-block mb-3">
        ← Back to List
      </Link>

      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start">
            <h1 className="h4">{ticket.title}</h1>
            <div className="d-flex gap-2">
              <SeverityBadge severity={ticket.severity} />
              <StatusBadge status={ticket.status} />
            </div>
          </div>
          <p className="text-muted mb-1">Service: {ticket.serviceName}</p>
          <p>{ticket.description}</p>
          <p className="text-muted small mb-0">
            Crated at: {new Date(ticket.createdAt).toLocaleString('en-GB')}
            {ticket.updatedAt &&
              ` • Updated at: ${new Date(ticket.updatedAt).toLocaleString('en-GB')}`}
            {ticket.resolvedAt &&
              ` • Resolved at: ${new Date(ticket.resolvedAt).toLocaleString('en-GB')}`}
          </p>
          {canManage && users && (
            <p className='text-muted small mb-0'>
            Created by: {resolveUserEmail(users, ticket.createdByUserId)}
            {ticket.assignedToUserId && 
            `• Assigned to: ${resolveUserEmail(users, ticket.assignedToUserId)}`}
            </p>
          )}
        </div>
      </div>

      {canManage && (
        <div className="card mb-4">
          <div className="card-body">
            <h2 className="h5 mb-3">Edit Ticket</h2>
            <form onSubmit={handleUpdate} className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Service</label>
                <input
                  type="text"
                  className="form-control"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Severity</label>
                <select
                  className="form-select"
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value) as Severity)}
                >
                  {Object.entries(SeverityLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(Number(e.target.value) as Status)}
                >
                  {Object.entries(StatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Assigned to</label>
                {users ? (
                  <select
                    className="form-select"
                    value={assignedToUserId}
                    onChange={(e) => setAssignedToUserId(e.target.value)}
                  >
                    <option value="">No assigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.email}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    placeholder="GUID usera, puste = brak przypisania"
                    value={assignedToUserId}
                    onChange={(e) => setAssignedToUserId(e.target.value)}
                  />
                )}
              </div>
              <div className="col-12 d-flex align-items-center gap-3">
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save changes'}
                </button>
                {saveSuccess && <span className="text-success">Saved</span>}
                {saveError && <span className="text-danger">{saveError}</span>}
              </div>
            </form>
          </div>
        </div>
      )}

      {canManage && (
        <div className="row">
          <div className="col-md-7 mb-4">
            <CommentsSection ticketId={ticketId}  users={users}/>
          </div>
          <div className="col-md-5 mb-4">
            <HistoryLog key={historyVersion} ticketId={ticketId} users={users}/>
          </div>
        </div>
      )}
    </div>
  );
}