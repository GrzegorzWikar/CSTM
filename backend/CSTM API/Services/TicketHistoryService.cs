using CSTM_API.Data;
using CSTM_API.DTO_s;
using CSTM_API.Models;
using CSTM_API.Services.Interface;
using Microsoft.EntityFrameworkCore;
using System.Reflection;
using System.Security.Claims;

namespace CSTM_API.Services
{
    public class TicketHistoryService : ITicketHistoryService
    {
        private const int MaxCommentLengthInHistory = 200;
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TicketHistoryService(ApplicationDbContext context, IHttpContextAccessor contextAccessor)
        {
            _context = context;
            _httpContextAccessor = contextAccessor;
        }
        public Task AddHistoryAsync(UpdateTicketRequest request, Ticket ticket, PropertyInfo propertyInfo)
        {
            var userId = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId is null) throw new UnauthorizedAccessException();

            var oldProperty = ticket.GetType().GetProperty(propertyInfo.Name);
            var newProperty = request.GetType().GetProperty(propertyInfo.Name);

            if(oldProperty is null || newProperty is null) throw new InvalidOperationException($"Property not found: {propertyInfo.Name}.");

            var history = new TicketHistory
            {
                TicketId = ticket.Id,
                OldStatus = $"{propertyInfo.Name}: {oldProperty.GetValue(ticket)?.ToString()}",
                NewStatus = $"{propertyInfo.Name}: {newProperty.GetValue(request)?.ToString()}",
                ChangeByUserId = userId,
                ChangeAt = DateTime.UtcNow
            };

            _context.TicketHistories.Add(history);

            return Task.CompletedTask;
        }

        public Task AddCommentHistoryAsync(int ticketId, string userId, string? oldContent, string newContent)
        {
            var history = new TicketHistory
            {
                TicketId = ticketId,
                OldStatus = $"Comment: {Shorten(oldContent)}",
                NewStatus = $"Comment: {Shorten(newContent)}",
                ChangeByUserId = userId,
                ChangeAt = DateTime.UtcNow
            };

            _context.TicketHistories.Add(history);

            return Task.CompletedTask;
        }

        private static string Shorten(string? content)
        {
            if (string.IsNullOrEmpty(content)) return string.Empty;

            return content.Length <= MaxCommentLengthInHistory
                ? content
                : content[..MaxCommentLengthInHistory] + "...";
        }

        public async Task<List<TicketHistoryResponse>> GetHistoryByTicketIdAsync(int ticketId)
        {
            return await _context.TicketHistories
                .AsNoTracking()
                .Where(x => x.TicketId == ticketId)
                .OrderByDescending(x => x.ChangeAt)
                .Select(x =>  new TicketHistoryResponse
                {
                    Id = x.Id,
                    OldStatus = x.OldStatus,
                    NewStatus = x.NewStatus,
                    ChangeByUserId = x.ChangeByUserId,
                    ChangeAt = x.ChangeAt
                })
                .ToListAsync();
        }
    }
}
