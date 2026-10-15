using Azure.Identity;
using Azure.Messaging.ServiceBus;

namespace CSTM_API.Services.Messaging
{
    public class ServiceBusOptions
    {
        public const string SectionName = "ServiceBus";

        public bool Enabled { get; set; }

        public string? ConnectionString { get; set; }

        public string? FullyQualifiedNamespace { get; set; }

        public string QueueName { get; set; } = "ticket-events";

        public ServiceBusClient CreateClient()
        {
            if(!string.IsNullOrWhiteSpace(ConnectionString)) return new ServiceBusClient(ConnectionString);

            if(!string.IsNullOrWhiteSpace(FullyQualifiedNamespace)) return new ServiceBusClient(FullyQualifiedNamespace, new DefaultAzureCredential());

            throw new InvalidOperationException(
                "ServiceBus:Enabled = true, but missing ServiceBus:ConnectionString (emulator) or ServiceBus:FullyQualifiedNamespace (Azure).");
        }
    }
}
