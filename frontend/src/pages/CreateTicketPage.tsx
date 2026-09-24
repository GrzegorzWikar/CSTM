import { useState, type SyntheticEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createTicket } from "../api/TicketApi";
import { Severity, SeverityLabels } from "../types/Enums";

export default function CreateTicketPage(){
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [serviceName, setServiceName] = useState('');
    const [severity, setSeverity] = useState<Severity>(Severity.Sev3);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try{
            const ticket = await createTicket({title, description, serviceName, severity});
            navigate(`/tickets/${ticket.id}`);
        }catch{
            setError('Faild to create ticket');
        }finally{
            setIsSubmitting(false);
        }
    }

    return (
        <div>
            <Link to='/' className="d-inline-block mb-3">
                ← Back to list
            </Link>
            <div className="card" style={{maxWidth: 600}}>
                <div className="card-body">
                    <h1 className="h4 mb-3">New ticket</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Titile</label>
                            <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required/>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Description</label>
                            <textarea className="form-control" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required/>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Service</label>
                            <input type="text" className="form-control" value={serviceName} onChange={(e) => setServiceName(e.target.value)} required/>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Severity</label> 
                            <select className="form-select" value={severity} onChange={(e) => setSeverity(Number(e.target.value) as Severity)}>
                                {Object.entries(SeverityLabels).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {error && <div className="alert alert-danger py-2">{error}</div>}
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Created'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}