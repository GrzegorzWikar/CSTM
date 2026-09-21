using CSTM_API.Enum;

namespace CSTM_API.DTO_s
{
    public class UpdateTicketRequest
    {
        public int Id { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public Severity Severity { get; set; }
        public Status Status { get; set; }
        public string AssignedToUserId { get; set; } = string.Empty;
    }
}
