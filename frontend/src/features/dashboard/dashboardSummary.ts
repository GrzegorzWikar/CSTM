import {
  TicketSeverity,
  TicketStatus,
  type DashboardSummary,
  type Ticket,
  type TicketCountBySeverity,
  type TicketCountByStatus,
} from '../../types';

const openStatuses: TicketStatus[] = [
  TicketStatus.New,
  TicketStatus.Assigned,
  TicketStatus.InProgress,
  TicketStatus.WaitingForCustomer,
];

function createSeverityCounts(): TicketCountBySeverity {
  return {
    [TicketSeverity.Sev1]: 0,
    [TicketSeverity.Sev2]: 0,
    [TicketSeverity.Sev3]: 0,
    [TicketSeverity.Sev4]: 0,
  };
}

function createStatusCounts(): TicketCountByStatus {
  return {
    [TicketStatus.New]: 0,
    [TicketStatus.Assigned]: 0,
    [TicketStatus.InProgress]: 0,
    [TicketStatus.WaitingForCustomer]: 0,
    [TicketStatus.Resolved]: 0,
    [TicketStatus.Closed]: 0,
  };
}

function calculateAverageResolutionTimeHours(
  tickets: Ticket[],
): number | null {
  const resolutionTimes = tickets
    .filter(
      (
        ticket,
      ): ticket is Ticket & { resolvedAt: string } =>
        ticket.resolvedAt !== null,
    )
    .map((ticket) => {
      const createdAt = new Date(ticket.createdAt).getTime();
      const resolvedAt = new Date(ticket.resolvedAt).getTime();

      return resolvedAt - createdAt;
    })
    .filter((duration) => duration >= 0);

  if (resolutionTimes.length === 0) {
    return null;
  }

  const totalResolutionTime = resolutionTimes.reduce(
    (sum, duration) => sum + duration,
    0,
  );

  return (
    totalResolutionTime /
    resolutionTimes.length /
    3_600_000
  );
}

export function calculateDashboardSummary(
  tickets: Ticket[],
): DashboardSummary {
  const ticketsBySeverity = createSeverityCounts();
  const ticketsByStatus = createStatusCounts();

  for (const ticket of tickets) {
    ticketsBySeverity[ticket.severity] += 1;
    ticketsByStatus[ticket.status] += 1;
  }

  return {
    totalTickets: tickets.length,
    openTickets: tickets.filter((ticket) =>
      openStatuses.includes(ticket.status),
    ).length,
    resolvedTickets: tickets.filter(
      (ticket) =>
        ticket.status === TicketStatus.Resolved ||
        ticket.status === TicketStatus.Closed,
    ).length,
    ticketsBySeverity,
    ticketsByStatus,
    averageResolutionTimeHours:
      calculateAverageResolutionTimeHours(tickets),
  };
}