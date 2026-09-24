using CSTM_API.Data;
using CSTM_API.DTO_s.Requests;
using CSTM_API.DTO_s.Responses;
using CSTM_API.Mappers;
using CSTM_API.Models;
using CSTM_API.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace CSTM_API.Services
{
    public class TicketCommentService : ITicketComments
    {
        private readonly ApplicationDbContext _context;
        private readonly TicketCommentMapper _ticketCommentMapper;
        public TicketCommentService(ApplicationDbContext context)
        {
            _context = context;
            _ticketCommentMapper = new TicketCommentMapper();
        }

        public async Task<TicketCommentResponse> CreateTicketCommentAsync(string userId, int ticketId, CreateTicketCommentRequest newComment)
        {
            TicketComment ticketComment = _ticketCommentMapper.ToEntity(newComment);
            ticketComment.TicketId = ticketId;
            ticketComment.UserId = userId;

            await _context.TicketComments.AddAsync(ticketComment);
            await _context.SaveChangesAsync();

            return _ticketCommentMapper.MapToTicketCommentResponse(ticketComment);
        }

        public async Task<IEnumerable<TicketCommentResponse>> GetTicketCommentsByTicketIdAsync(int ticketId)
        {
            List<TicketComment> ticketComments = await _context.TicketComments.Where(tc => tc.TicketId == ticketId).OrderByDescending(c => c.CreatedAt).ToListAsync();

            return ticketComments.Select(_ticketCommentMapper.MapToTicketCommentResponse);
        }

        public async Task<TicketCommentResponse> UpdateTicketCommentAsync(int ticketId, UpdateTicketCommentRequest updatedComment)
        {
            TicketComment? ticketComment = await _context.TicketComments.FindAsync(updatedComment.Id);

            if (ticketComment == null || ticketComment.TicketId != ticketId)
            {
                throw new Exception("Ticket comment not found");
            }

            ticketComment.Content = updatedComment.Content;

            _context.TicketComments.Update(ticketComment);
            await _context.SaveChangesAsync();

            return _ticketCommentMapper.MapToTicketCommentResponse(ticketComment);
        }
    }
}
