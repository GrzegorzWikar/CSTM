export type {
  ApiError,
  ApiFieldErrors,
  ProblemDetails,
  ValidationProblemDetails,
} from './api';

export type {
  JwtClaims,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RegisterRequest,
  User,
  UserInfoResponse,
  UserRole,
} from './auth';

export type {
  DashboardSummary,
  TicketCountBySeverity,
  TicketCountByStatus,
} from './dashboard';

export {
  TicketSeverity,
  TicketStatus,
  ticketSeverityLabels,
  ticketStatusLabels,
} from './ticket';

export type {
  AzureServiceName,
  CreateTicketCommentRequest,
  CreateTicketRequest,
  CreateTicketResponse,
  PagedResult,
  PagedTicketsResult,
  Ticket,
  TicketComment,
  TicketHistoryEntry,
  TicketQueryParams,
  UpdateTicketCommentRequest,
  UpdateTicketRequest,
  UpdateTicketStatusRequest,
} from './ticket';