import axiosClient from './axiosClient';
import type { PagedResult } from '../types/Common';
import type { CreateTicketRequest, TicketFilterParameters, TicketResponse, UpdateTicketRequest } from '../types/Ticket';


export const getTickets = async ( filters: TicketFilterParameters ) : Promise<PagedResult<TicketResponse>> => {
    const response = await axiosClient.get<PagedResult<TicketResponse>>('/api/Tickets', {
        params: filters
    });
    return response.data;
};

export const getTicketById = async (id: number): Promise<TicketResponse> => {
    const response = await axiosClient.get<TicketResponse>(`/api/Tickets/${id}`);
    return response.data;
};

export const createTicket = async (data: CreateTicketRequest): Promise<TicketResponse> => {
    const response = await axiosClient.post<TicketResponse>('/api/Tickets', data);
    return response.data;
}

export const updateTicket = async (data: UpdateTicketRequest): Promise<TicketResponse> => {
    const response = await axiosClient.put<TicketResponse>(`/api/Tickets/${data.id}`, data);
    return response.data;
}