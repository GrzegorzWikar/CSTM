using System.Text.Json;
using Azure.Messaging.ServiceBus;
using CSTM_API.Enum;
using CSTM_API.Events;
using Microsoft.Extensions.Options;

namespace CSTM_API.Services.Messaging
{
    public sealed class TicketEventsConsumer : BackgroundService
    {
        private readonly ServiceBusProcessor _processor;
        private readonly ILogger<TicketEventsConsumer> _logger;

        public TicketEventsConsumer(ServiceBusClient client, IOptions<ServiceBusOptions> options, ILogger<TicketEventsConsumer> logger)
        {
            _logger = logger;

            _processor = client.CreateProcessor(options.Value.QueueName, new ServiceBusProcessorOptions{AutoCompleteMessages = false, MaxConcurrentCalls = 1});

            _processor.ProcessMessageAsync += HandleMessageAsync;
            _processor.ProcessErrorAsync += HandleErrorAsync;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            try
            {
                await _processor.StartProcessingAsync(stoppingToken);
                _logger.LogInformation("TicketEventConsumer lising on queue {Queue}.", _processor.EntityPath);
            }
            catch (OperationCanceledException)
            {}
            catch (Exception ex) 
            {
                _logger.LogError(ex, "Unable to start TicketEventConsumer - API is working but events wont be recived");
            }
        }

        public override async Task StopAsync(CancellationToken cancellationToken) 
        {
            try
            {
                if (_processor.IsProcessing) await _processor.StopProcessingAsync(cancellationToken);
            }
            catch (Exception ex) 
            {
                _logger.LogWarning(ex, "Error when stoping TicketEventsConsumer.");
            }

            await _processor.DisposeAsync();
            await base.StopAsync(cancellationToken);
        }

        private async Task HandleMessageAsync(ProcessMessageEventArgs args)
        {
            TicketEvent? ticketEvent;

            try
            {
                ticketEvent = args.Message.Body.ToObjectFromJson<TicketEvent>(TicketEventSerializer.Options);
            }
            catch (JsonException ex) 
            {
                _logger.LogError(ex, "Incorrect JSON in the message {MessageId} - moving to the dead-letter.", args.Message.MessageId);
                await args.DeadLetterMessageAsync(args.Message, "InvalidPayload", ex.Message, args.CancellationToken);
                return;
            }

            if(ticketEvent is null)
            {
                await args.DeadLetterMessageAsync(args.Message, "EmptyPaylod", "The message does not contain an event.", args.CancellationToken);
                return;
            }

            if (ticketEvent.EventType == TicketEventTypes.Created && ticketEvent.Severity == Severity.Sev_1)
            {
                _logger.LogWarning("SEV_1! New Ticket {TicketId} for service {ServiceName} - requires immediate action. ", ticketEvent.TicketId, ticketEvent.ServiceName);
            }
            else
            {
                _logger.LogInformation("Received event {EventType} for ticket {TicketId} ({OldValue} -> {NewValue}).", ticketEvent.EventType, ticketEvent.TicketId, ticketEvent.OldValue, ticketEvent.NewValue);
            }

            await args.CompleteMessageAsync(args.Message, args.CancellationToken);
        }

        private Task HandleErrorAsync(ProcessErrorEventArgs args)
        {
            _logger.LogError(args.Exception, "Service Bus error (source: {ErrorSource}, namespace: {Namespace}, entity: {Entity}).", args.ErrorSource, args.FullyQualifiedNamespace, args.EntityPath);
            return Task.CompletedTask;
        }
    }
}
