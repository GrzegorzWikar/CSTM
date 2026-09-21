import type {
  TicketSeverity,
  TicketStatus,
} from './ticket';

export type TicketCountBySeverity = Record<TicketSeverity, number>;

export type TicketCountByStatus = Record<TicketStatus, number>;

export interface DashboardSummary {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  ticketsBySeverity: TicketCountBySeverity;
  ticketsByStatus: TicketCountByStatus;
  averageResolutionTimeHours: number | null;
}