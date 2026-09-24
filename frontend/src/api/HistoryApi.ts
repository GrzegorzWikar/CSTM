import axiosClient from './axiosClient';
import type { TicketHistoryResponse } from '../types/History';

export const getTicketHistory = async (ticketId: number): Promise<TicketHistoryResponse[]> => {
    const response = await axiosClient.get<TicketHistoryResponse[]>(`/api/Tickets/${ticketId}/history`);
    return response.data;
};

