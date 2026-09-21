using CSTM_API.DTO_s.Responses;
using CSTM_API.DTO_s.Requests;

namespace CSTM_API.Services.Interface
{
    public interface ITicketComments
    {

        Task<IEnumerable<TicketCommentResponse>> GetTicketCommentsByTicketIdAsync(int ticketId);
        Task<TicketCommentResponse> UpdateTicketCommentAsync(UpdateTicketCommentRequest updatedComment);
        Task<TicketCommentResponse> CreateTicketCommentAsync(string userId, int ticketId, CreateTicketCommentRequest newComment);
    }
}
