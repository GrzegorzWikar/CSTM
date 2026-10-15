using CSTM_API.Data;
using CSTM_API.DTO_s;
using CSTM_API.DTO_s.Requests;
using CSTM_API.DTO_s.Responses;
using CSTM_API.Enum;
using CSTM_API.Events;
using CSTM_API.Mappers;
using CSTM_API.Models;
using CSTM_API.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace CSTM_API.Services
{
    public class TicketService : ITicketService
    {
        private readonly ITicketHistoryService _ticketHistoryService;
        private readonly ApplicationDbContext _context;
        private readonly ITicketEventPublisher _eventPublisher;
        private readonly ILogger _logger;
        private readonly TicketMapper _ticketMapper;
        private const int MaxPageSize = 100;

        public TicketService(ITicketHistoryService ticketHistoryService, ApplicationDbContext context, ITicketEventPublisher eventPublisher, ILogger<TicketService> logger)
        {
            _ticketHistoryService = ticketHistoryService;
            _context = context;
            _eventPublisher = eventPublisher;
            _logger = logger;
            _ticketMapper = new TicketMapper();
        }

        public async Task UpdateTicketAsync(string userId, UpdateTicketRequest request)
        {
            var ticket = await _context.Tickets.FindAsync(request.Id);

            if (ticket is null)
            {
                throw new KeyNotFoundException($"Ticket with ID {request.Id} not found.");
            }

            string? newAssignee = string.IsNullOrWhiteSpace(request.AssignedToUserId) ? null : request.AssignedToUserId;
            Status oldStatus = ticket.Status;
            string? oldAssignee = ticket.AssignedToUserId;
            bool statusChanged = false;
            bool assigneeChanged = false;

            if (request.ServiceName != ticket.ServiceName)
            {

                var property = ticket.GetType().GetProperty(nameof(ticket.ServiceName));
                if (property != null) await _ticketHistoryService.AddHistoryAsync(request, ticket, property);

                ticket.ServiceName = request.ServiceName;
            }

            if (!request.Severity.Equals(ticket.Severity))
            {
                var property = ticket.GetType().GetProperty(nameof(ticket.Severity));
                if (property != null) await _ticketHistoryService.AddHistoryAsync(request, ticket, property);

                ticket.Severity = request.Severity;
            }

            if (!request.Status.Equals(ticket.Status))
            {

                var property = ticket.GetType().GetProperty(nameof(ticket.Status));
                if (property != null) await _ticketHistoryService.AddHistoryAsync(request, ticket, property);

                if (request.Status == Status.Resolved) ticket.ResolvedAt = DateTime.UtcNow;

                ticket.Status = request.Status;
                statusChanged = true;
            }

            if (newAssignee != ticket.AssignedToUserId) 
            { 

                var property = ticket.GetType().GetProperty(nameof(ticket.AssignedToUserId));
                if (property != null) await _ticketHistoryService.AddHistoryAsync(request, ticket, property);

                ticket.AssignedToUserId = newAssignee;
                assigneeChanged  = true;
            }

            ticket.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            if (statusChanged) await PublishSafelyAsync(CreateEvent(TicketEventTypes.StatusChanged, ticket, userId, oldStatus.ToString(), ticket.Status.ToString()));

            if (assigneeChanged) await PublishSafelyAsync(CreateEvent(TicketEventTypes.Assigned, ticket, userId, oldAssignee, ticket.AssignedToUserId));
        }


        public async Task<TicketResponse?> GetTicketByTicketIdAsync(int ticketId)
        {
            Ticket? ticket = await _context.Tickets.FirstOrDefaultAsync(x => x.Id == ticketId);

            if (ticket is null) return null; 

            return _ticketMapper.MapToTicketResponse(ticket);
        }

        public async Task<TicketResponse> CreateTicketAsync(string userId, CreateTicketRequest ticketRequest)
        {
            Ticket ticket = _ticketMapper.ToEntity(ticketRequest);
            ticket.CreatedByUserId = userId;

            await _context.Tickets.AddAsync(ticket);
            await _context.SaveChangesAsync();

            await PublishSafelyAsync(CreateEvent(TicketEventTypes.Created, ticket, userId));

            TicketResponse ticketResponse = _ticketMapper.MapToTicketResponse(ticket);

            return ticketResponse;
        }

        private static TicketEvent CreateEvent(string eventType, Ticket ticket, string actorUserId, string? oldValue = null, string? newValue = null)
        {
            return new TicketEvent(Guid.NewGuid(), eventType, ticket.Id, ticket.ServiceName, ticket.Severity, ticket.Status, actorUserId, DateTime.UtcNow, oldValue, newValue);
        }

        private async Task PublishSafelyAsync(TicketEvent ticketEvent)
        {
            try
            {
                await _eventPublisher.PublishAsync(ticketEvent);
            }
            catch (Exception ex) 
            {
                _logger.LogError(ex, "Failed to publish the {EventType} event for ticket {TicketId}.", ticketEvent.EventType, ticketEvent.TicketId);
            }
        }

        public async Task<PagedResoult<TicketResponse>> GetTicketsAsync(TicketFilterParameters filters, CancellationToken cancellationToken)
        {
            int page = Math.Max(filters.Page, 1);
            int pageSize = Math.Clamp(filters.PageCount, 1, MaxPageSize);

            IQueryable<Ticket> query = _context.Tickets.AsNoTracking();

            if(!string.IsNullOrWhiteSpace(filters.Title))
            {
                string titleFilter = filters.Title.Trim();

                query = query.Where(t => t.Title.Contains(titleFilter));
            }

            if (!string.IsNullOrWhiteSpace(filters.ServiceName))
            {
                string serviceName = filters.ServiceName.Trim();

                query = query.Where(t => t.ServiceName.Contains(serviceName));
            }

            if (filters.Severity.HasValue)
            {
                query = query.Where(t => t.Severity == filters.Severity.Value);
            }

            if (filters.Status.HasValue)
            {
                query = query.Where(t => t.Status == filters.Status.Value);
            }

            if (!string.IsNullOrWhiteSpace(filters.CreatedByUserId))
            {
                string createdByUserId = filters.CreatedByUserId.Trim();
                query = query.Where(t => t.CreatedByUserId == createdByUserId);
            }

            if (!string.IsNullOrWhiteSpace(filters.AssignedToUserId))
            {
                string assignedToUserId = filters.AssignedToUserId.Trim();
                query = query.Where(t => t.AssignedToUserId == assignedToUserId);
            }

            if(filters.CreatedAtFrom.HasValue)
            {
                query = query.Where(t => t.CreatedAt >= filters.CreatedAtFrom.Value);
            }
            
            if (filters.CreatedAtTo.HasValue)
            {
                query = query.Where(t => t.CreatedAt <= filters.CreatedAtTo.Value);
            }

            if (filters.UpdatedAtFrom.HasValue)
            {
                query = query.Where(t => t.UpdatedAt.HasValue && t.UpdatedAt.Value >= filters.UpdatedAtFrom.Value);
            }

            if (filters.UpdatedAtTo.HasValue)
            {
                query = query.Where(t => t.UpdatedAt.HasValue && t.UpdatedAt.Value <= filters.UpdatedAtTo.Value);
            }

            if (filters.ResolvedAtFrom.HasValue)
            {
                query = query.Where(t => t.ResolvedAt.HasValue && t.ResolvedAt.Value >= filters.ResolvedAtFrom.Value);
            }

            if (filters.ResolvedAtTo.HasValue)
            {
                query = query.Where(t => t.ResolvedAt.HasValue && t.ResolvedAt.Value <= filters.ResolvedAtTo.Value);
            }

            int totalCount = await query.CountAsync(cancellationToken);

            List<TicketResponse> items = await query
                .OrderByDescending(t => t.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(t => _ticketMapper.MapToTicketResponse(t))
                .ToListAsync(cancellationToken);

            int totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize);

            return new PagedResoult<TicketResponse>(items, page, pageSize, totalCount, totalPages);
        }
    }
}
