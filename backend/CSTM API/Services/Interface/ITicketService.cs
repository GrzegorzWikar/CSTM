using CSTM_API.DTO_s;
using CSTM_API.DTO_s.Requests;
using CSTM_API.DTO_s.Responses;
using CSTM_API.Enum;

namespace CSTM_API.Services.Interface
{
    public interface ITicketService
    {
        Task<TicketResponse> CreateTicketAsync(CreateTicketRequest ticketRequest);
        Task UpdateTicketAsync(UpdateTicketRequest ticketRequest);
        Task<TicketResponse?> GetTicketByTicketIdAsync(int ticketId);
        Task<IEnumerable<TicketResponse>> GetTicketsByStatusAsync(Status status);
        Task<PagedResoult<TicketResponse>> GetTicketsAsync(TicketFilterParameters filters, CancellationToken cancellationToken);
    }
}
