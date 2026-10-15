using CSTM_API.Data;
using CSTM_API.Enum;
using CSTM_API.Models;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace CSTM_API.Tests.Support
{
    public sealed class TestDb : IDisposable
    {
        private readonly SqliteConnection _connection;
        private readonly DbContextOptions<ApplicationDbContext> _options;

        public ApplicationDbContext Context { get; }

        public TestDb()
        {
            _connection = new SqliteConnection("Data Source=:memory:;Foreign Keys=True");
            _connection.Open();

            _options = new DbContextOptionsBuilder<ApplicationDbContext>().UseSqlite(_connection).Options;

            Context = new ApplicationDbContext(_options);
            Context.Database.EnsureCreated();
        }

        public ApplicationDbContext NewContext() => new(_options);

        public async Task AddUsersAsync(params string[] userIds)
        {
            foreach(var id in userIds)
            {
                Context.Users.Add(new ApplicationUser
                {
                    Id = id,
                    UserName = id,
                    NormalizedUserName = id.ToUpperInvariant(),
                    Email = $"{id}@test.local",
                    NormalizedEmail = $"{id}@test.local".ToUpperInvariant()
                });
            }

            await Context.SaveChangesAsync();
        }

        public async Task<Ticket> AddTicketAsync(
            string createdByUserId,
            string? assignedToUserId = null,
            Status status = Status.New,
            Severity severity = Severity.Sev_3,
            string ServiceName = "Azure Batch")
        {
            var ticket = new Ticket
            {
                Title = "Testowy ticket",
                Description = "Opis testowego ticketu",
                ServiceName = ServiceName,
                Severity = severity,
                Status = status,
                CreatedByUserId = createdByUserId,
                AssignedToUserId = assignedToUserId,
            };

            await using var context = NewContext();
            context.Tickets.Add(ticket);
            await context.SaveChangesAsync();

            return ticket;
        }

        public void Dispose()
        {
            Context.Dispose();
            _connection.Dispose();
        }
    }
}
