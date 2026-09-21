using CSTM_API.Enum;

namespace CSTM_API.DTO_s
{
    public class TicketResponse
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ServiceName { get; set; } = string.Empty;
        public Severity Severity { get; set; }
        public Status Status { get; set; }
        public string CreatedByUserId { get; set; } = string.Empty;
        public string? AssignedToUserId {  get; set; } = string.Empty;
        public DateTime CreatedAt {  get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
    }
}
