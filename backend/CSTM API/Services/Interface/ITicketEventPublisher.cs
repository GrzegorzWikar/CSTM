using CSTM_API.Events;

namespace CSTM_API.Services.Interface
{
    public interface ITicketEventPublisher
    {
        Task PublishAsync(TicketEvent  ticketEvent, CancellationToken cancelationToken = default);
    }
}
