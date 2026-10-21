using CSTM_API.DTO_s;
using CSTM_API.Models;
using System.Reflection;

namespace CSTM_API.Services.Interface
{
    public interface ITicketHistoryService
    {
        Task AddHistoryAsync(UpdateTicketRequest request, Ticket ticket, PropertyInfo propertyInfo);
        Task AddCommentHistoryAsync(int ticketId, string userId, string? oldContent, string newContent);
        Task<List<TicketHistoryResponse>> GetHistoryByTicketIdAsync(int ticketId);
    }
}
