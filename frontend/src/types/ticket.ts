import type { Severity, Status } from "./Enums";

export interface TicketResponse{
    id: number;
    title: string;
    description: string;
    serviceName: string;
    severity: Severity;
    status: Status;
    createByUserId: string;
    assignedToUserId: string | null;
    createAt: string;
    updateAt: string | null;
    resolvedAt: string | null;
}

export interface CreateTicketRequest {
    title: string;
    description: string;
    serviceName: string;
    severity: Severity;
}

export interface UpdateTicketRequest {
    id: number;
    serviceName: string;
    severity: Severity;
    status: Status;
    assignedToUserId: string;
}

export interface TicketFilterParameters {
    title?: string;
    description?: string;
    serviceName?: string;
    severity?: Severity;
    status?: Status;
    createByUserId?: string;
    assignedToUserId?: string;
    createdAtFrom?: string;
    createdAtTo?: string;
    updatedAtFrom?: string;
    updatedAtTo?: string;
    resolvedAtFrom?: string;
    resolvedAtTo?: string;
    page?: number;
    pageCount?: number;
}