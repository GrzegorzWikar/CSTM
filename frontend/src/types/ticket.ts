export enum TicketStatus {
  New = 0,
  Assigned = 1,
  InProgress = 2,
  WaitingForCustomer = 3,
  Resolved = 4,
  Closed = 5,
}

export enum TicketSeverity {
  Sev1 = 0,
  Sev2 = 1,
  Sev3 = 2,
  Sev4 = 3,
}

export type AzureServiceName =
  | 'Azure App Service'
  | 'Azure SQL Database'
  | 'Azure Virtual Machine'
  | 'Azure Storage Account'
  | 'Microsoft Entra ID'
  | 'Azure Networking';

export interface Ticket {
  id: number;
  title: string;
  description: string;
  serviceName: string;
  severity: TicketSeverity;
  status: TicketStatus;
  createdByUserId: string;
  assignedToUserId: string | null;
  createdAt: string;
  updatedAt: string | null;
  resolvedAt: string | null;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  serviceName: AzureServiceName;
  severity: TicketSeverity;
}

export interface CreateTicketResponse {
  id: number;
  title: string;
  description: string;
  serviceName: string;
  severity: TicketSeverity;
  status: TicketStatus;
  createdByUserId: string;
  assignedToUserId: string | null;
  createdAt: string;
}

export interface UpdateTicketRequest {
  id?: number;
  serviceName?: string;
  severity?: TicketSeverity;
  status?: TicketStatus;
  assignedToUserId?: string;
}

export interface UpdateTicketStatusRequest {
  status: TicketStatus;
}

export interface TicketComment {
  id: number;
  userId: string;
  content: string;
  createdAt: string;
}

export interface CreateTicketCommentRequest {
  content: string;
}

export interface UpdateTicketCommentRequest {
  id: number;
  content: string;
}

export interface TicketHistoryEntry {
  id: number;
  oldStatus: string;
  newStatus: string;
  changeByUserId: string;
  changeAt: string;
}

export interface TicketQueryParams {
  title?: string;
  description?: string;
  serviceName?: string;
  severity?: TicketSeverity;
  status?: TicketStatus;
  createdByUserId?: string;
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

export interface PagedResult<TItem> {
  items: TItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export type PagedTicketsResult = PagedResult<Ticket>;

export const ticketStatusLabels: Record<TicketStatus, string> = {
  [TicketStatus.New]: 'New',
  [TicketStatus.Assigned]: 'Assigned',
  [TicketStatus.InProgress]: 'In Progress',
  [TicketStatus.WaitingForCustomer]: 'Waiting for Customer',
  [TicketStatus.Resolved]: 'Resolved',
  [TicketStatus.Closed]: 'Closed',
};

export const ticketSeverityLabels: Record<TicketSeverity, string> = {
  [TicketSeverity.Sev1]: 'Sev1',
  [TicketSeverity.Sev2]: 'Sev2',
  [TicketSeverity.Sev3]: 'Sev3',
  [TicketSeverity.Sev4]: 'Sev4',
};