using CSTM_API.Data;
using CSTM_API.DTO_s;
using CSTM_API.DTO_s.Requests;
using CSTM_API.DTO_s.Responses;
using CSTM_API.Enum;
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
        private readonly TicketMapper _ticketMapper;
        private const int MaxPageSize = 100;

        public TicketService(ITicketHistoryService ticketHistoryService, ApplicationDbContext context)
        {
            _ticketHistoryService = ticketHistoryService;
            _context = context;
            _ticketMapper = new TicketMapper();
        }

        public async Task UpdateTicketAsync(UpdateTicketRequest request)
        {
            var ticket = await _context.Tickets.FindAsync(request.Id);

            if (ticket is null)
            {
                throw new KeyNotFoundException($"Ticket with ID {request.Id} not found.");
            }

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
            }

            if (!request.AssignedToUserId.Equals(ticket.AssignedToUserId))
            {

                var property = ticket.GetType().GetProperty(nameof(ticket.AssignedToUserId));
                if (property != null) await _ticketHistoryService.AddHistoryAsync(request, ticket, property);

                ticket.AssignedToUserId = request.AssignedToUserId;
            }

            ticket.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        public async Task<TicketResponse> GetTicketByTicketIdAsync(int ticketId)
        {
            Ticket ticket = await _context.Tickets.FirstAsync(x => x.Id == ticketId);
            return _ticketMapper.MapToTicketResponse(ticket);
        }

        public async Task<IEnumerable<TicketResponse>> GetTicketsByStatusAsync(Status status)
        {
            IEnumerable<Ticket> tickets = await _context.Tickets.Where(x => x.Status == status).ToListAsync();
            
            IEnumerable<TicketResponse> ticketResponses = [];
            foreach (var ticket in tickets)
            {
                ticketResponses.Append(_ticketMapper.MapToTicketResponse(ticket));
            }
            return ticketResponses;
        }

        public async Task<TicketResponse> CreateTicketAsync(CreateTicketRequest ticketRequest)
        {
            Ticket ticket = _ticketMapper.ToEntity(ticketRequest);

            await _context.Tickets.AddAsync(ticket);
            await _context.SaveChangesAsync();

            TicketResponse ticketResponse = _ticketMapper.MapToTicketResponse(ticket);

            return ticketResponse;
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
