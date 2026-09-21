using Microsoft.EntityFrameworkCore;
using CSTM_API.Data;
using Microsoft.AspNetCore.Identity;
using CSTM_API.Models;
using Scalar.AspNetCore;
using CSTM_API.Services.Interface;
using CSTM_API.Services;
using CSTM_API.Mappers;

var builder = WebApplication.CreateBuilder(args);


// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddSingleton<TicketMapper>();

//Identity SQLite
builder.Services.AddDbContext<ApplicationDbContext>(opt =>
{
    opt.UseSqlite(builder.Configuration.GetConnectionString("CSTMContext"));
});

builder.Services
    .AddIdentityApiEndpoints<ApplicationUser>()
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>();

builder.Services.AddAuthentication();

builder.Services.AddHttpContextAccessor();

builder.Services.AddScoped<ITicketService, TicketService>();
builder.Services.AddScoped<ITicketHistoryService, TicketHistoryService>();
builder.Services.AddScoped<ITicketComments, TicketCommentService>();

var app = builder.Build();

await IdentitySeeder.SeedRolesAsync(app.Services);


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();
app.MapIdentityApi<ApplicationUser>();


app.MapControllers();

app.Run();
