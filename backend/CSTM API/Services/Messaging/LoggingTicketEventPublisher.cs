using CSTM_API.Events;
using CSTM_API.Services.Interface;

namespace CSTM_API.Services.Messaging
{
    public class LoggingTicketEventPublisher : ITicketEventPublisher
    {
        private readonly ILogger<LoggingTicketEventPublisher> _logger;

        public LoggingTicketEventPublisher(ILogger<LoggingTicketEventPublisher> logger)
        {
            _logger = logger;
        }

        public Task PublishAsync(TicketEvent ticketEvent, CancellationToken cancellationToken = default) 
        {
            _logger.LogInformation(
                "ServiceBus disabled - event only in log: {EventType} ticket={TicketId} actor={ActorUserId} {OldValue} -> {NewValue} (eventId={EventId})",
                ticketEvent.EventType,
                ticketEvent.TicketId,
                ticketEvent.ActorUserId,
                ticketEvent.OldValue,
                ticketEvent.NewValue,
                ticketEvent.EventId);

            return Task.CompletedTask;
        }
    }
}
