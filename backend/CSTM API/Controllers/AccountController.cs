using CSTM_API.Data;
using CSTM_API.Models;
using CSTM_API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CSTM_API.Controllers
{
    public record RegisterUserRequest(string Email, string Password);
    public record AssignRoleRequest(string UserId, string Role);

    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;

        public AccountController(UserManager<ApplicationUser> userManager, ApplicationDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }


        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<ActionResult> Register(RegisterUserRequest request)
        {
            var user = new ApplicationUser
            {
                UserName = request.Email,
                Email = request.Email
            };

            var result = await _userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(error.Code, error.Description);
                }
                return ValidationProblem(ModelState);
            }

            await _userManager.AddToRoleAsync(user, "User");

            return Ok();
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult> GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId is null)
            {
                return Unauthorized();
            }

            var user = await _userManager.FindByIdAsync(userId);

            if (user is null)
            {
                return Unauthorized();
            }

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                id = user.Id,
                email = user.Email,
                roles
            });
        }

        [Authorize(Roles = "Support,Admin")]
        [HttpGet("users")]
        public async Task<ActionResult> GetUsers()
        {
            var users = await _userManager.Users
                                .OrderBy(u => u.Email)
                                .Select(u => new {id = u.Id, email = u.Email})
                                .ToListAsync();
            
            var roleRows = await (from ur in _context.UserRoles
                                    join r in _context.Roles on ur.RoleId equals r.Id
                                    select new {ur.UserId, RoleName = r.Name})
                                    .ToListAsync();

            var rolesByUser = roleRows
                .GroupBy(x => x.UserId)
                .ToDictionary(g => g.Key, g => g.Select(x => x.RoleName ?? string.Empty).ToArray());
                 
            var result = new List<object>(users.Count);
            foreach (var u in users)
            {
                rolesByUser.TryGetValue(u.id, out var roles);
                result.Add(new { id = u.id, email = u.email, roles = roles ?? Array.Empty<string>()});
            }


            return Ok(users);
        }

        [Authorize(Roles="Support,Admin")]
        [HttpPost("assign-role")]
        public async Task<ActionResult> AssignRole(AssignRoleRequest request)
        {
            var actorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (actorId is null) return Unauthorized();

            var actor = await _userManager.FindByIdAsync(actorId);
            if(actor is null) return Unauthorized();

            var target = await _userManager.FindByIdAsync(request.UserId);
            if (target is null) return NotFound("User not found");

            var actorRoles = await _userManager.GetRolesAsync(actor);
            var targetRoles = await _userManager.GetRolesAsync(target);

            var decision = RoleChangePolicy.Evaluate(actorRoles, actor.Id, target.Id, targetRoles, request.Role);

            if (decision == RoleChangeDecision.InvalidRole)
            {
                return BadRequest($"Bad role. Allowed are: {string.Join(",", RoleChangePolicy.AllRoles)}");
            }

            if (decision == RoleChangeDecision.CannotChangeOwnRole)
            {
                return BadRequest("You cannot change own role.");
            }

            if (decision == RoleChangeDecision.Forbidden)
            {
                return StatusCode(StatusCodes.Status403Forbidden, "You are not allowed to make this role change.");
            }

            var removeResult = await _userManager.RemoveFromRolesAsync(target, targetRoles);
            if (!removeResult.Succeeded)
            {
                return Problem("Could not remove the previous role.");
            }

            var addResult = await _userManager.AddToRoleAsync(target, request.Role);
            if (!addResult.Succeeded)
            {
                return Problem("Could not assign the new role.");
            }

            return Ok();
        }
    }
}