using CSTM_API.Data;
using CSTM_API.DTO_s;
using CSTM_API.DTO_s.Requests;
using CSTM_API.DTO_s.Responses;
using CSTM_API.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;


namespace CSTM_API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TicketsController : ControllerBase
    {

        private readonly ITicketHistoryService _ticketHistoryService;
        private readonly ITicketService _ticketService;
        private readonly ITicketComments _ticketCommentsService;
        public TicketsController(ApplicationDbContext context, ITicketHistoryService ticketHistoryService, ITicketService ticketService, ITicketComments ticketCommentsService)
        {

            _ticketHistoryService = ticketHistoryService;
            _ticketService = ticketService;
            _ticketCommentsService = ticketCommentsService;
        }

        // GET: api/Ticket
        [HttpGet]
        [ProducesResponseType(typeof(PagedResoult<TicketResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<PagedResoult<TicketResponse>>> GetTickets([FromQuery] TicketFilterParameters filters, CancellationToken cancellationToken)
        {
            ValidateDateRange(filters.CreatedAtFrom, filters.CreatedAtTo, nameof(filters.CreatedAtFrom));
            ValidateDateRange(filters.UpdatedAtFrom, filters.UpdatedAtTo, nameof(filters.UpdatedAtFrom));
            ValidateDateRange(filters.ResolvedAtFrom, filters.ResolvedAtTo, nameof(filters.ResolvedAtFrom));

            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var result =  await _ticketService.GetTicketsAsync(filters, cancellationToken);
            
            return Ok(result);
        }

        private void ValidateDateRange(DateTime? from, DateTime? to, string propertyName)
        {
            if (from.HasValue && to.HasValue && from.Value > to.Value)
            {
                ModelState.AddModelError(propertyName, $"{propertyName} cannot be greater than {propertyName.Replace("From", "To")}.");
            }
        }

        // GET: api/Ticket/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TicketResponse>> GetTicket(int id)
        {
            var ticket = await _ticketService.GetTicketByTicketIdAsync(id);

            if (ticket == null)
            {
                return NotFound();
            }

            return Ok(ticket);
        }


        // POST: api/Ticket
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<CreateTicketResponse>> PostTicket(CreateTicketRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId is null)
            {
                return Unauthorized();
            }

            TicketResponse ticketResponse = await _ticketService.CreateTicketAsync(request);

            if (ticketResponse == null)
            {
                return BadRequest("Failed to create ticket.");
            }

            return Ok(ticketResponse);
        }

        // PUT: api/Ticket/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id:int}")]
        public async Task<ActionResult<TicketResponse>> PutTicket(UpdateTicketRequest request)
        {
            try
            {
                await _ticketService.UpdateTicketAsync(request);
            }
            catch(DbUpdateException ex)
            {
                return BadRequest(ex.InnerException?.Message ?? ex.Message);
            }

            return await GetTicket(request.Id);
        }

        // GET: api/Ticket/5/history
        [HttpGet("{id}/history")]
        public async Task<ActionResult<IEnumerable<TicketHistoryResponse>>> GetTicketHistoryByTicketId(int id)
        {
            var history = await _ticketHistoryService.GetHistoryByTicketIdAsync(id);

            return Ok(history);
        }

        [HttpGet("{ticketId}/comments")]
        public async Task<ActionResult<IEnumerable<TicketCommentResponse>>> GetTicketCommentsByTicketId(int ticketId)
        {
            return Ok(await _ticketCommentsService.GetTicketCommentsByTicketIdAsync(ticketId));
        }

        [HttpPost("{ticketId}/comments")]
        public async Task<ActionResult> CreateTicketCommentByTicketId(int ticketId, CreateTicketCommentRequest ticketCommentRequest)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId is null)
            {
                return Unauthorized();
            }

            return Ok(await _ticketCommentsService.CreateTicketCommentAsync(userId, ticketId, ticketCommentRequest));
        }

        [HttpPut("{ticketId}/comments")]
        public async Task<ActionResult<TicketCommentResponse>> UpdateTicketCommentByTicketId(int ticketId, UpdateTicketCommentRequest request)
        {

            return Ok(await _ticketCommentsService.UpdateTicketCommentAsync(request));
        }
    }
}
