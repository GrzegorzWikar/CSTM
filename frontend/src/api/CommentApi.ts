import axiosClient from "./axiosClient";
import type { CreateTicketCommentRequest, TicketCommentResponse, UpdateTicketCommentRequest } from "../types/Comment";

export const getComments = async (ticketId: number): Promise<TicketCommentResponse[]> => {
    const response = await axiosClient.get<TicketCommentResponse[]>(`/api/Tickets/${ticketId}/comments`);
    return response.data;
};

export const createComment = async (ticketId: number, data: CreateTicketCommentRequest): Promise<TicketCommentResponse> => {
    const response = await axiosClient.post<TicketCommentResponse>(`/api/Ticket/${ticketId}/comments`, data);
    return response.data;
};

export const updateComment = async (ticketId: number, data: UpdateTicketCommentRequest): Promise<TicketCommentResponse> => {
    const response = await axiosClient.put<TicketCommentResponse>(`/api/Tickets/${ticketId}/comments`, data);
    return response.data;
};

