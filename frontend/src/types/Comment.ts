export interface TicketCommentResponse{
    id: number;
    userId: string;
    content: string;
    createdAt: string
}

export interface CreateTicketCommentRequest{
    content: string;
}

export interface UpdateTicketCommentRequest{
    id: number;
    content: string;
}