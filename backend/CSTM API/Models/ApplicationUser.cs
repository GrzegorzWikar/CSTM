using Microsoft.AspNetCore.Identity;

namespace CSTM_API.Models
{
    public class ApplicationUser : IdentityUser
    {
        public DateTime CreateAt { get; set; } = DateTime.UtcNow;

        public ICollection<TicketComment> Comments { get; set; } = [];
        public ICollection<Ticket> CreatedTickets { get; set; } = [];
        public ICollection<Ticket> AssignedTickets { get; set; } = [];
    }
}
