using CSTM_API.DTO_s.Requests;
using CSTM_API.Services;
using CSTM_API.Tests.Support;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace CSTM_API.Tests
{
    public sealed class TicketCommentServiceTests : IDisposable
    {
        private const string Creator = "user-1";
        private const string Agent = "support-1";

        private readonly TestDb _db = new();
        private readonly TicketCommentService _service;

        public TicketCommentServiceTests()
        {
            _db.AddUsersAsync(Creator, Agent).GetAwaiter().GetResult();

            var history = new TicketHistoryService(_db.Context, new HttpContextAccessor());
            _service = new TicketCommentService(_db.Context, history);
        }

        public void Dispose() => _db.Dispose();

        [Fact]
        public async Task CreateComment_SaveCommetAndAddsHistoryEntry()
        {
            var ticket = await _db.AddTicketAsync(Creator);

            var response = await _service.CreateTicketCommentAsync(Agent, ticket.Id, new CreateTicketCommentRequest {Content = "Restarted the pool"});

            await using var context = _db.NewContext();
            Assert.Equal(1, await context.TicketComments.CountAsync(c => c.TicketId == ticket.Id));
            Assert.Equal("Restarted the pool", response.Content);

            var entry = await context.TicketHistories.SingleAsync(h => h.TicketId == ticket.Id);
            Assert.Equal("Comment: ", entry.OldStatus);
            Assert.Equal("Comment: Restarted the pool", entry.NewStatus);
            Assert.Equal(Agent, entry.ChangeByUserId);
        }

        [Fact]
        public async Task UpdateComment_ChangedContent_AddHistoryEntryWithOldAndNewText()
        {
            var ticket = await _db.AddTicketAsync(Creator);
            var created = await _service.CreateTicketCommentAsync(Agent, ticket.Id, new CreateTicketCommentRequest { Content = "First version"});

            await _service.UpdateTicketCommentAsync(Agent, ticket.Id, new UpdateTicketCommentRequest { Id = created.Id, Content = "Second version"});
            
            await using var context = _db.NewContext();
            var entries = await context.TicketHistories.Where(h => h.TicketId == ticket.Id).OrderBy(h => h.Id).ToListAsync();

            Assert.Equal(2, entries.Count);
            Assert.Equal("Comment: First version", entries[1].OldStatus);
            Assert.Equal("Comment: Second version", entries[1].NewStatus);
            Assert.Equal(Agent, entries[1].ChangeByUserId);
        }

        [Fact]
        public async Task UpdateComment_SameContent_DoesNotAddHistoryEntry()
        {
            var ticket = await _db.AddTicketAsync(Creator);
            var created = await _service.CreateTicketCommentAsync(Agent, ticket.Id, new CreateTicketCommentRequest { Content = "Unchanged"});

            await _service.UpdateTicketCommentAsync(Agent, ticket.Id, new UpdateTicketCommentRequest{ Id = created.Id, Content = "Unchanged"});

            await using var context = _db.NewContext();
            Assert.Equal(1, await context.TicketHistories.CountAsync(h => h.TicketId == ticket.Id));
        }

        [Fact]
        public async Task UpdateComment_CommentFromAnotherTicket_ThrowsAndAddsNoHistory()
        {
            var ticket = await _db.AddTicketAsync(Creator);
            var otherTicket = await _db.AddTicketAsync(Creator);
            var created  = await _service.CreateTicketCommentAsync(Agent, ticket.Id, new CreateTicketCommentRequest { Content = "Belongs to the first ticket"});

            await Assert.ThrowsAnyAsync<Exception>(() => _service.UpdateTicketCommentAsync(Agent, otherTicket.Id, new UpdateTicketCommentRequest { Id = created.Id, Content = "Hijacked"}));

            await using var context = _db.NewContext();
            Assert.Equal(0, await context.TicketHistories.CountAsync(h => h.TicketId == otherTicket.Id));
            Assert.Equal("Belongs to the first ticket", (await context.TicketComments.SingleAsync()).Content);
        }

        [Fact]
        public async Task CreateComment_LongContent_IsShortenedInHistoryButFullInComment()
        {
            var ticket = await _db.AddTicketAsync(Creator);
            var longText = new string('x',250);

            await _service.CreateTicketCommentAsync(Agent, ticket.Id, new CreateTicketCommentRequest { Content = longText });
 
            await using var context = _db.NewContext();
            var entry = await context.TicketHistories.SingleAsync(h => h.TicketId == ticket.Id);
            Assert.Equal("Comment: ".Length + 200 + "...".Length, entry.NewStatus.Length);
            Assert.EndsWith("...", entry.NewStatus);
            Assert.Equal(longText, (await context.TicketComments.SingleAsync()).Content);
        }
    }
}