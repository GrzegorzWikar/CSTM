using System.Text.Json;
using System.Text.Json.Serialization;
using CSTM_API.Enum;

namespace CSTM_API.Events
{
    public record TicketEvent(
        Guid EventId,
        string EventType,
        int TicketId,
        string ServiceName,
        Severity Severity,
        Status Status,
        string ActorUserId,
        DateTime OccuredAtUtc,
        string? OldValue = null,
        string? NewValue = null);
    
    public static class TicketEventTypes
    {
        public const string Created = "TicketCreated";
        public const string StatusChanged = "TicketStatusChanged";
        public const string Assigned = "TicketAssigned";
    }

    public static class TicketEventSerializer
    {
        public static readonly JsonSerializerOptions Options = CreateOptions();

        private static JsonSerializerOptions CreateOptions()
        {
            var options = new JsonSerializerOptions(JsonSerializerDefaults.Web);
            options.Converters.Add(new JsonStringEnumConverter());
            return options;
        }
    }
    
}
