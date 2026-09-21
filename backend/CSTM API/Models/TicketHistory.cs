namespace CSTM_API.Models
{
    public class TicketHistory()
    {
        public int Id { get; set; }
        public int TicketId { get; set; }
        public Ticket Ticket { get; set; } = null!;
        public string OldStatus { get; set; } = string.Empty;
        public string NewStatus { get; set; } = string.Empty;
        public string ChangeByUserId { get; set; } = string.Empty;
        public ApplicationUser ChangeByUser { get; set; } = null!;
        public DateTime ChangeAt { get; set; } = DateTime.UtcNow;

    }
}
