using Azure.Messaging.ServiceBus;
using CSTM_API.Events;
using CSTM_API.Services.Interface;
using Microsoft.Extensions.Options;

namespace CSTM_API.Services.Messaging
{ 
    public sealed class ServiceBusTicketEventPublisher : ITicketEventPublisher, IAsyncDisposable
    {
        private readonly ServiceBusSender _sender;

        public ServiceBusTicketEventPublisher (ServiceBusClient client, IOptions<ServiceBusOptions> options)
        {
            _sender = client.CreateSender(options.Value.QueueName);
        }

        public async Task PublishAsync(TicketEvent ticketEvent, CancellationToken cancellationToken = default)
        {
            var message = new ServiceBusMessage(BinaryData.FromObjectAsJson(ticketEvent, TicketEventSerializer.Options))
            {
                MessageId = ticketEvent.EventId.ToString(),
                Subject = ticketEvent.EventType,
                ContentType = "application/json",
                CorrelationId = ticketEvent.TicketId.ToString()
            };

            await _sender.SendMessageAsync(message, cancellationToken);
        }

        public ValueTask DisposeAsync() => _sender.DisposeAsync();
    }
}
