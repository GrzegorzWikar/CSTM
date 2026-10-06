using CSTM_API.DTO_s;
using CSTM_API.DTO_s.Requests;
using CSTM_API.DTO_s.Responses;

namespace CSTM_API.Services.Interface
{
    public interface ITicketService
    {
        Task<TicketResponse> CreateTicketAsync(string userId, CreateTicketRequest ticketRequest);
        Task UpdateTicketAsync(UpdateTicketRequest ticketRequest);
        Task<TicketResponse?> GetTicketByTicketIdAsync(int ticketId);
        Task<PagedResoult<TicketResponse>> GetTicketsAsync(TicketFilterParameters filters, CancellationToken cancellationToken);
    }
}
