using CSTM_API.DTO_s.Responses;
using Riok.Mapperly.Abstractions;
using CSTM_API.Models;
using CSTM_API.DTO_s.Requests;

namespace CSTM_API.Mappers
{
    [Mapper]
    public partial class TicketCommentMapper
    {
        [MapperIgnoreSource(nameof(TicketComment.Ticket))]
        [MapperIgnoreSource(nameof(TicketComment.TicketId))]
        [MapperIgnoreSource(nameof(TicketComment.User))]
        public partial TicketCommentResponse MapToTicketCommentResponse(TicketComment comment);

        [MapperIgnoreTarget(nameof(TicketComment.Id))]
        [MapperIgnoreTarget(nameof(TicketComment.Ticket))]
        [MapperIgnoreTarget(nameof(TicketComment.TicketId))]
        [MapperIgnoreTarget(nameof(TicketComment.User))]
        [MapperIgnoreTarget(nameof(TicketComment.UserId))]
        [MapperIgnoreTarget(nameof(TicketComment.CreatedAt))]
        public partial TicketComment ToEntity(CreateTicketCommentRequest request);
    }
}
