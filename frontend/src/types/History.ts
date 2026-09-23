export interface TicketHistoryResponse{
    id: number;
    oldStatus: string;
    newStatus: string;
    changedByUserId: string;
    changedAt: string;
}