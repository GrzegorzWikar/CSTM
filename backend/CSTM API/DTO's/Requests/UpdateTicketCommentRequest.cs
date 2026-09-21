namespace CSTM_API.DTO_s.Requests
{
    public class UpdateTicketCommentRequest
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
    }
}
