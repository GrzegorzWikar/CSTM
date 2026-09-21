using CSTM_API.Enum;

namespace CSTM_API.Models
{
    public class Ticket
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty; 
        public string Description {  get; set; } = string.Empty;
        public string ServiceName { get; set; } = string.Empty;
        public Severity Severity { get; set; }
        public Status Status { get; set; } = Status.New;
        public string CreatedByUserId { get; set; } = string.Empty;
        public ApplicationUser CreatedByUser { get; set; } = null!;
        public string? AssignedToUserId { get; set; }
        public ApplicationUser? AssignedToUser { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt {  get; set; }
        public DateTime? ResolvedAt {  get; set; }
        public ICollection<TicketHistory> TicketHistory { get; set; } = null!;
        public ICollection<TicketComment> Comments { get; set; } = [];
    }
}
