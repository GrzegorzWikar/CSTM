import { SeverityLables, type Severity } from "../types/Enums";

const severityColors: Record<Severity, string> = {
    0: 'danger',
    1: 'warning',
    2: 'info',
    3: 'secondary'
}

export default function SeverityBadge({severity} : {severity: Severity}) {
    return <span className={`badge text-bg-${severityColors[severity]}`}>{SeverityLables[severity]}</span> 
}