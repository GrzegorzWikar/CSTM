using System.Security.Claims;
using CSTM_API.DTO_s;
using CSTM_API.Enum;
using CSTM_API.Events;
using CSTM_API.Models;
using CSTM_API.Services;
using CSTM_API.Tests.Support;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

namespace CSTM_API.Tests
{
    public sealed class TicketServiceTests : IDisposable
    {
        private const string Creator = "user-1";
        private const string Agent = "support-1";
        private const string OtherAgent = "support-2";

        private readonly TestDb _db = new();
        private readonly FakeTicketEventPublisher _publisher = new();
        private readonly TicketService _service;

        public TicketServiceTests()
        {
            _db.AddUsersAsync(Creator, Agent, OtherAgent).GetAwaiter().GetResult();

            var accessor = new HttpContextAccessor
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, Agent) }, "TestAuth"))
                }
            };

            var history = new TicketHistoryService(_db.Context, accessor);
            _service = new TicketService(history, _db.Context, _publisher, NullLogger<TicketService>.Instance);
        }

        public void Dispose() => _db.Dispose();

        private static UpdateTicketRequest RequestFrom(Ticket ticket) => new()
        {
            Id = ticket.Id,
            ServiceName = ticket.ServiceName,
            Severity = ticket.Severity,
            Status = ticket.Status,
            AssignedToUserId = ticket.AssignedToUserId ?? string.Empty
        };

        [Fact]
        public async Task CreateTicket_SavesTicketAndPublishesCreatedEvent()
        {
            var request = new CreateTicketRequest
            {
                Title = "The pool in Azure Batch won't start",
                Description = "No nodes after scaling",
                ServiceName = "Azure Batch",
                Severity = Severity.Sev_1
            };

            var response = await _service.CreateTicketAsync(Creator, request);

            await using var context = _db.NewContext();
            var saved = await context.Tickets.SingleAsync(t => t.Id == response.Id);
            Assert.Equal(Creator, saved.CreatedByUserId);
            Assert.Equal(Status.New,saved.Status);

            var ev = Assert.Single(_publisher.Published);
            Assert.Equal(TicketEventTypes.Created, ev.EventType);
            Assert.Equal(response.Id, ev.TicketId);
            Assert.Equal("Azure Batch", ev.ServiceName);
            Assert.Equal(Severity.Sev_1, ev.Severity);
            Assert.Equal(Creator, ev.ActorUserId);
            Assert.NotEqual(Guid.Empty, ev.EventId);
        }

        [Fact]
        public async Task CreateTicket_WhenBrokerFails_TicketIsStillSaved()
        {
            _publisher.ExceptionToThrow = new InvalidOperationException("Service Bus Unavilable.");

            var response = await _service.CreateTicketAsync(Creator, new CreateTicketRequest
            {
                Title = "Test",
                Description = "Test",
                ServiceName = "APIM",
                Severity = Severity.Sev_3
            });

            await using var context = _db.NewContext();
            Assert.True(await context.Tickets.AnyAsync(t => t.Id == response.Id));
            Assert.Empty(_publisher.Published);
        }

        //--------------------UpdateTicketAsync---------------------

        [Fact]
        public async Task UpdateTicket_StatusChange_PublishesStatusChangedWithOldAndNewValue()
        {
            var ticket = await _db.AddTicketAsync(Creator);
            var request = RequestFrom(ticket);
            request.Status = Status.InProgress;

            await _service.UpdateTicketAsync(Agent, request);

            var ev = Assert.Single(_publisher.Published);
            Assert.Equal(TicketEventTypes.StatusChanged, ev.EventType);
            Assert.Equal(ticket.Id, ev.TicketId);
            Assert.Equal("New", ev.OldValue);
            Assert.Equal("InProgress", ev.NewValue);
            Assert.Equal(Status.InProgress, ev.Status);
            Assert.Equal(Agent, ev.ActorUserId);
        }

        [Fact]
        public async Task UpdatetTicket_ResolvedStatus_SetsResolvedAt()
        {
            var ticket = await _db.AddTicketAsync(Creator);
            var request = RequestFrom(ticket);
            request.Status = Status.Resolved;

            await _service.UpdateTicketAsync(Agent,request);

            await using var context = _db.NewContext();
            var saved = await context.Tickets.SingleAsync(t => t.Id == ticket.Id);
            Assert.Equal(Status.Resolved, saved.Status);
            Assert.NotNull(saved.ResolvedAt);
            Assert.NotNull(saved.UpdatedAt);
        }

        [Fact]
        public async Task UpdateTicket_AssigningTicket_PublishesAssignedEvent()
        {
            var ticket = await _db.AddTicketAsync(Creator);
            var request = RequestFrom(ticket);
            request.AssignedToUserId = OtherAgent;

            await _service.UpdateTicketAsync(Agent, request);

            await using var context = _db.NewContext();
            var saved = await context.Tickets.SingleAsync(t => t.Id == request.Id);
            Assert.Equal(OtherAgent, saved.AssignedToUserId);

            var ev = Assert.Single(_publisher.Published);
            Assert.Equal(TicketEventTypes.Assigned, ev.EventType);
            Assert.Null(ev.OldValue);
            Assert.Equal(OtherAgent, ev.NewValue);
        }

        [Fact]
        public async Task UpdateTicket_EmptyAssignee_UnassignsTicketInsteadOfBreakingForeginKey()
        {
            var ticket = await _db.AddTicketAsync(Creator, assignedToUserId: OtherAgent);
            var request = RequestFrom(ticket);
            request.AssignedToUserId = string.Empty;

            await _service.UpdateTicketAsync(Agent,request);

            await using var context = _db.NewContext();
            var saved = await context.Tickets.SingleAsync(t => t.Id ==  request.Id);
            Assert.Null(saved.AssignedToUserId);

            var ev = Assert.Single(_publisher.Published);
            Assert.Equal(TicketEventTypes.Assigned, ev.EventType);
            Assert.Equal(OtherAgent, ev.OldValue);
            Assert.Null(ev.NewValue);
        }

        [Fact]
        public async Task UpdateTicket_UnassignedTicketWithEmptyAssignee_IsNotChanged()
        {
            var ticket = await _db.AddTicketAsync(Creator);

            await _service.UpdateTicketAsync(Agent, RequestFrom(ticket));

            Assert.Empty(_publisher.Published);
            await using var context = _db.NewContext();
            Assert.Empty(await context.TicketHistories.ToListAsync());
        }

        [Fact]
        public async Task UpdateTicket_StatusAndAssigneeChange_PublishesBothEvents()
        {
            var ticket = await _db.AddTicketAsync(Creator);
            var request = RequestFrom(ticket);
            request.Status = Status.Assigned;
            request.AssignedToUserId = OtherAgent;

            await _service.UpdateTicketAsync(Agent, request);

            Assert.Equal(new[] {TicketEventTypes.StatusChanged, TicketEventTypes.Assigned}, _publisher.Published.Select(e => e.EventType).ToArray());
        }

        [Fact]
        public async Task UpdateTicket_StatusChange_WithHistoryEntry()
        {
            var ticket = await _db.AddTicketAsync(Creator);
            var request = RequestFrom(ticket);
            request.Status = Status.InProgress;

            await _service.UpdateTicketAsync(Agent,request);

            await using var context = _db.NewContext();
            var history = Assert.Single(await context.TicketHistories.Where(h => h.TicketId == ticket.Id).ToListAsync());
            Assert.Equal("Status: New", history.OldStatus);
            Assert.Equal("Status: InProgress", history.NewStatus);
            Assert.Equal(Agent, history.ChangeByUserId);
        }

        [Fact]
        public async Task UpdateTicket_WhenBrokerFails_ChangeIsStillSaved()
        {
            _publisher.ExceptionToThrow = new InvalidOperationException("Servis Bus unavilable.");
            var ticket = await _db.AddTicketAsync(Creator);
            var request = RequestFrom(ticket);
            request.Status = Status.Closed;

            await _service.UpdateTicketAsync(Agent, request);

            await using var context = _db.NewContext();
            var saved = await context.Tickets.SingleAsync(t => t.Id  == ticket.Id);
            Assert.Equal(Status.Closed, saved.Status);
        }

        [Fact]
        public async Task UpdateTicket_WhenSaveFails_PublishesNothing()
        {
            var ticket = await _db.AddTicketAsync(Creator);
            var request = RequestFrom(ticket);
            request.AssignedToUserId = "no-such-user";

            await Assert.ThrowsAsync<DbUpdateException>(() => _service.UpdateTicketAsync(Agent, request));

            Assert.Empty(_publisher.Published);
        }

        [Fact]
        public async Task UpdateTicket_UnknowTicket_ThrowsKeyNotFound()
        {
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateTicketAsync(Agent, new UpdateTicketRequest { Id = 999 }));
        }
    }
}
