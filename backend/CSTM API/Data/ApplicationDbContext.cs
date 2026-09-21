using CSTM_API.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CSTM_API.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
        
        public DbSet<Ticket> Tickets => Set<Ticket>();
        public DbSet<TicketComment> TicketComments => Set<TicketComment>();
        public DbSet<TicketHistory> TicketHistories => Set<TicketHistory>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            ConfigureTickets(modelBuilder);
            ConfigureTicketComments(modelBuilder);
            ConfigureTicketHistories(modelBuilder);
        }

        private static void ConfigureTickets(ModelBuilder modelBuilder) 
        {
            modelBuilder.Entity<Ticket>(entity => 
            {
                entity.HasKey(x => x.Id);

                entity.Property(x => x.Title)
                    .HasMaxLength(100)
                    .IsRequired();

                entity.HasOne(x => x.CreatedByUser)
                    .WithMany(x => x.CreatedTickets)
                    .HasForeignKey(x => x.CreatedByUserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.AssignedToUser)
                    .WithMany(x => x.AssignedTickets)
                    .HasForeignKey(x => x.AssignedToUserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(x => x.TicketHistory)
                    .WithOne(x => x.Ticket)
                    .HasForeignKey(x => x.TicketId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }

        private static void ConfigureTicketComments(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<TicketComment>(entity =>
            {
                entity.HasKey(x => x.Id);

                entity.HasOne(x => x.Ticket)
                    .WithMany(x => x.Comments)
                    .HasForeignKey(x => x.TicketId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(x => x.User)
                    .WithMany(x => x.Comments)
                    .HasForeignKey(x => x.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }

        private static void ConfigureTicketHistories(ModelBuilder modelBuilder)
        { 
            modelBuilder.Entity<TicketHistory>(entity =>
            {
                entity.HasKey(x => x.Id);

                entity.HasOne(x => x.Ticket)
                    .WithMany(x => x.TicketHistory)
                    .HasForeignKey(x => x.TicketId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }

    }
}
