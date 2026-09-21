using CSTM_API.Enum;

namespace CSTM_API.DTO_s
{
    public class CreateTicketRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ServiceName { get; set; } = string.Empty;
        public Severity Severity { get; set; }
    }
}
