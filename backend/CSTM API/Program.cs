using Microsoft.EntityFrameworkCore;
using CSTM_API.Data;
using Microsoft.AspNetCore.Identity;
using CSTM_API.Models;
using Scalar.AspNetCore;
using CSTM_API.Services.Interface;
using CSTM_API.Services;
using CSTM_API.Mappers;
using Azure.Identity;

var builder = WebApplication.CreateBuilder(args);

var keyVaultName = builder.Configuration["KeyVaultName"];
if (!string.IsNullOrWhiteSpace(keyVaultName))
{
    var keyVaultUri = new Uri($"https://{keyVaultName}.vault.azure.net/");
    builder.Configuration.AddAzureKeyVault(keyVaultUri, new DefaultAzureCredential());
}

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddSingleton<TicketMapper>();

var connectionString = builder.Configuration["SqlConnectionString"]
    ?? builder.Configuration.GetConnectionString("CSTMContext")
    ?? throw new InvalidOperationException(
        "There is no connection string to database. Setup ConnectionString:CSTMContext (localy) or secrets SqlConnectionString in KeyValut (Azure).");
builder.Services.AddDbContext<ApplicationDbContext>(opt => {
    opt.UseSqlServer(connectionString);
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

const string FrontendCorsPolicy = "FrontendCorsPolicy";

builder.Services.AddCors(opt => {
    opt.AddPolicy(FrontendCorsPolicy, policy =>
    {
        var allowedOrgins = builder.Configuration.GetSection("Cors:AllowedOrgins").Get<string[]>()
        ?? new[] { "http://localhost:5173" };

        policy.WithOrigins(allowedOrgins)
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

var app =builder.Build();

await IdentitySeeder.SeedRolesAsync(app.Services);

if (app.Environment.IsDevelopment())
{
    await IdentitySeeder.SeedDefaultAdminAsync(app.Services, app.Configuration);
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

app.UseCors(FrontendCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();
app.MapIdentityApi<ApplicationUser>();

app.MapControllers();

app.Run();