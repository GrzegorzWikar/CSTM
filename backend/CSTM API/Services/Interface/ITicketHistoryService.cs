using CSTM_API.DTO_s;
using CSTM_API.Models;
using System.Reflection;

namespace CSTM_API.Services.Interface
{
    public interface ITicketHistoryService
    {
        Task AddHistoryAsync(UpdateTicketRequest request, Ticket ticket, PropertyInfo propertyInfo);
        Task<List<TicketHistoryResponse>> GetHistoryByTicketIdAsync(int ticketId);
    }
}
