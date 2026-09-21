namespace CSTM_API.DTO_s
{
    public class TicketHistoryResponse
    {
        public int Id { get; set; }
        public string OldStatus { get; set; } = string.Empty;
        public string NewStatus { get; set; } = string.Empty;
        public string ChangeByUserId { get; set; } = string.Empty;
        public DateTime ChangeAt { get; set; }
    }
}
