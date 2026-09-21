using CSTM_API.Enum;
using CSTM_API.Models;

namespace CSTM_API.DTO_s
{
    public class CreateTicketResponse(Ticket ticket)
    {
        public int Id { get; set; } = ticket.Id;
        public string Title { get; set; } = ticket.Title;
        public string Description {  get; set; } = ticket.Description;
        public string ServiceName { get; set; } = ticket.ServiceName;
        public Severity Severity {  get; set; } = ticket.Severity;
        public Status Status { get; set; } = ticket.Status;
        public string CreatedByUserId { get; set; } = ticket.CreatedByUserId;
        public string? AssignedToUserId {  get; set; } = ticket.AssignedToUserId;
        public DateTime CreatedAt { get; set; } = ticket.CreatedAt;
    }
}
