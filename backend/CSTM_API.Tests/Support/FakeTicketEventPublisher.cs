using CSTM_API.Events;
using CSTM_API.Services.Interface;

namespace CSTM_API.Tests.Support
{
    public sealed class FakeTicketEventPublisher : ITicketEventPublisher
    {
        public List<TicketEvent> Published { get; } = new();

        public Exception? ExceptionToThrow { get; set; }

        public Task PublishAsync(TicketEvent ticketEvent, CancellationToken  cancellationToken = default)
        {
            if(ExceptionToThrow is not null)
            {
                return Task.FromException(ExceptionToThrow);
            }

            Published.Add(ticketEvent);
            return Task.CompletedTask;
        }
    }
}
