using Riok.Mapperly.Abstractions;
using CSTM_API.DTO_s;
using CSTM_API.Models;

namespace CSTM_API.Mappers
{
    [Mapper]
    public partial class TicketMapper
    {
        [MapperIgnoreSource(nameof(Ticket.CreatedByUser))]
        [MapperIgnoreSource(nameof(Ticket.AssignedToUser))]
        [MapperIgnoreSource(nameof(Ticket.TicketHistory))]
        [MapperIgnoreSource(nameof(Ticket.Comments))]
        public partial TicketResponse MapToTicketResponse(Ticket ticket);

        [MapperIgnoreTarget(nameof(Ticket.Id))]
        [MapperIgnoreTarget(nameof(Ticket.Status))]
        [MapperIgnoreTarget(nameof(Ticket.CreatedByUserId))]
        [MapperIgnoreTarget(nameof(Ticket.CreatedByUser))]
        [MapperIgnoreTarget(nameof(Ticket.AssignedToUserId))]
        [MapperIgnoreTarget(nameof(Ticket.AssignedToUser))]
        [MapperIgnoreTarget(nameof(Ticket.CreatedAt))]
        [MapperIgnoreTarget(nameof(Ticket.UpdatedAt))]
        [MapperIgnoreTarget(nameof(Ticket.ResolvedAt))]
        [MapperIgnoreTarget(nameof(Ticket.TicketHistory))]
        [MapperIgnoreTarget(nameof(Ticket.Comments))]
        public partial Ticket ToEntity(CreateTicketRequest request);

        [MapperIgnoreTarget(nameof(Ticket.Title))]
        [MapperIgnoreTarget(nameof(Ticket.Description))]
        [MapperIgnoreTarget(nameof(Ticket.CreatedByUserId))]
        [MapperIgnoreTarget(nameof(Ticket.CreatedByUser))]
        [MapperIgnoreTarget(nameof(Ticket.AssignedToUser))]
        [MapperIgnoreTarget(nameof(Ticket.CreatedAt))]
        [MapperIgnoreTarget(nameof(Ticket.UpdatedAt))]
        [MapperIgnoreTarget(nameof(Ticket.ResolvedAt))]
        [MapperIgnoreTarget(nameof(Ticket.TicketHistory))]
        [MapperIgnoreTarget(nameof(Ticket.Comments))]
        public partial void UpdateTicket(UpdateTicketRequest request, Ticket ticket);
    }
}
