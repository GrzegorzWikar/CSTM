import type {
  CreateTicketCommentRequest,
  CreateTicketRequest,
  CreateTicketResponse,
  PagedTicketsResult,
  Ticket,
  TicketComment,
  TicketHistoryEntry,
  TicketQueryParams,
  UpdateTicketCommentRequest,
  UpdateTicketRequest,
  UpdateTicketStatusRequest,
} from '../types';
import apiClient from './apiClient';

function removeUndefinedValues(
  params: TicketQueryParams,
): Record<string, string | number> {
  const result: Record<string, string | number> = {};

  if (params.title !== undefined) {
    result.Title = params.title;
  }

  if (params.description !== undefined) {
    result.Description = params.description;
  }

  if (params.serviceName !== undefined) {
    result.ServiceName = params.serviceName;
  }

  if (params.severity !== undefined) {
    result.Severity = params.severity;
  }

  if (params.status !== undefined) {
    result.Status = params.status;
  }

  if (params.createdByUserId !== undefined) {
    result.CreatedByUserId = params.createdByUserId;
  }

  if (params.assignedToUserId !== undefined) {
    result.AssignedToUserId = params.assignedToUserId;
  }

  if (params.createdAtFrom !== undefined) {
    result.CreatedAtFrom = params.createdAtFrom;
  }

  if (params.createdAtTo !== undefined) {
    result.CreatedAtTo = params.createdAtTo;
  }

  if (params.updatedAtFrom !== undefined) {
    result.UpdatedAtFrom = params.updatedAtFrom;
  }

  if (params.updatedAtTo !== undefined) {
    result.UpdatedAtTo = params.updatedAtTo;
  }

  if (params.resolvedAtFrom !== undefined) {
    result.ResolvedAtFrom = params.resolvedAtFrom;
  }

  if (params.resolvedAtTo !== undefined) {
    result.ResolvedAtTo = params.resolvedAtTo;
  }

  if (params.page !== undefined) {
    result.Page = params.page;
  }

  if (params.pageCount !== undefined) {
    result.PageCount = params.pageCount;
  }

  return result;
}

export async function getTickets(
  params: TicketQueryParams = {},
): Promise<PagedTicketsResult> {
  const response = await apiClient.get<PagedTicketsResult>(
    '/api/Tickets',
    {
      params: removeUndefinedValues(params),
    },
  );

  return response.data;
}

export async function getTicket(
  ticketId: number,
): Promise<Ticket> {
  const response = await apiClient.get<Ticket>(
    `/api/Tickets/${ticketId}`,
  );

  return response.data;
}

export async function createTicket(
  request: CreateTicketRequest,
): Promise<CreateTicketResponse> {
  const response = await apiClient.post<CreateTicketResponse>(
    '/api/Tickets',
    request,
  );

  return response.data;
}

export async function updateTicket(
  ticketId: number,
  request: UpdateTicketRequest,
): Promise<Ticket> {
  const response = await apiClient.put<Ticket>(
    `/api/Tickets/${ticketId}`,
    request,
  );

  return response.data;
}

export async function updateTicketStatus(
  ticketId: number,
  request: UpdateTicketStatusRequest,
): Promise<Ticket> {
  return updateTicket(ticketId, {
    status: request.status,
  });
}

export async function assignTicket(
  ticketId: number,
  assignedToUserId: string,
): Promise<Ticket> {
  return updateTicket(ticketId, {
    assignedToUserId,
  });
}

export async function getTicketHistory(
  ticketId: number,
): Promise<TicketHistoryEntry[]> {
  const response = await apiClient.get<TicketHistoryEntry[]>(
    `/api/Tickets/${ticketId}/history`,
  );

  return response.data;
}

export async function getTicketComments(
  ticketId: number,
): Promise<TicketComment[]> {
  const response = await apiClient.get<TicketComment[]>(
    `/api/Tickets/${ticketId}/comments`,
  );

  return response.data;
}

export async function createTicketComment(
  ticketId: number,
  request: CreateTicketCommentRequest,
): Promise<void> {
  await apiClient.post(
    `/api/Tickets/${ticketId}/comments`,
    request,
  );
}

export async function updateTicketComment(
  ticketId: number,
  request: UpdateTicketCommentRequest,
): Promise<TicketComment> {
  const response = await apiClient.put<TicketComment>(
    `/api/Tickets/${ticketId}/comments`,
    request,
  );

  return response.data;
}