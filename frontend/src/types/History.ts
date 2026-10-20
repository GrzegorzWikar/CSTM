export interface TicketHistoryResponse{
    id: number;
    oldStatus: string;
    newStatus: string;
    changeByUserId: string;
    changeAt: string;
}