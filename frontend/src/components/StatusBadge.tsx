import { StatusLabels, type Status } from "../types/Enums";

const statusColors: Record<Status, string> = {
    0: 'secondary',
    1: 'info',
    2: 'primary',
    3: 'warning',
    4: 'succesfull',
    5: 'dark',
};

export default function StatusBadge({status}: {status: Status}){
    return <span className={`badge text-bg-${statusColors[status]}`}>{StatusLabels[status]}</span>;
}