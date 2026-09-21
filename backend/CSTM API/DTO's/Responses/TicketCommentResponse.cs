namespace CSTM_API.DTO_s.Responses
{
    public class TicketCommentResponse
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
