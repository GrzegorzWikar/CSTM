using System.Text.Json;
using CSTM_API.Enum;
using CSTM_API.Events;
using CSTM_API.Services.Messaging;

namespace CSTM_API.Tests
{
    public class TicketEventTests
    {
        private static TicketEvent Sample() => new(
            Guid.Parse("11111111-1111-1111-1111-111111111111"),
            TicketEventTypes.Created,
            42,
            "Azure batch",
            Severity.Sev_1,
            Status.New,
            "user-1",
            new DateTime(2026, 10, 14, 12, 0, 0, DateTimeKind.Utc));


        [Fact]
        public void Serialize_UsesCamelCaseAndEnumNames()
        {
            var json = JsonSerializer.Serialize(Sample(), TicketEventSerializer.Options);

            Assert.Contains("\"eventType\":\"TicketCreated\"", json);
            Assert.Contains("\"ticketId\":42", json);
            Assert.Contains("\"severity\":\"Sev_1\"", json);
            Assert.Contains("\"status\":\"New\"", json);
        }

        [Fact]
        public void RoundTrip_PreservesAllFields()
        {
            var orginal = Sample() with { OldValue = "New", NewValue = "InProgress" };

            var json = JsonSerializer.Serialize(orginal, TicketEventSerializer.Options);
            var restored = JsonSerializer.Deserialize<TicketEvent>(json, TicketEventSerializer.Options);

            Assert.Equal(orginal,restored);
        }

        [Fact]
        public void Deserialize_BroketnJson_ThrowJsonException()
        {
            Assert.ThrowsAny<JsonException>(() => JsonSerializer.Deserialize<TicketEvent>( "{ This is not a Json", TicketEventSerializer.Options));
        }

        [Fact]
        public void Deserialize_UnknownEnumName_ThrowJsonException()
        {
            var json = JsonSerializer.Serialize(Sample(), TicketEventSerializer.Options).Replace("Sev_1", "Sev_9");

            Assert.ThrowsAny<JsonException>(() => JsonSerializer.Deserialize<TicketEvent>( json, TicketEventSerializer.Options));
        }
     }

    public class ServiceBusOptionsTests
    {
        [Fact]
        public void CreateClient_WithoutAnyEndpoint_Throws()
        {
            var options = new ServiceBusOptions { Enabled = true };

            Assert.Throws<InvalidOperationException>(() => options.CreateClient());
        }

        [Fact]
        public async Task CreateClient_WithEmulatorConnectionString_CreatesClientWithoutConnecting()
        {
            var options = new ServiceBusOptions
            {
                Enabled = true,
                ConnectionString = "Endpoint=sb://localhost;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=SAS_KEY_VALUE;UseDevelopmentEmulator=true;"
            };
            await using var client = options.CreateClient();

            Assert.NotNull(client);
        }
    }
}