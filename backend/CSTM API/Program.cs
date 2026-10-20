using Microsoft.EntityFrameworkCore;
using CSTM_API.Data;
using Microsoft.AspNetCore.Identity;
using CSTM_API.Models;
using Scalar.AspNetCore;
using CSTM_API.Services.Interface;
using CSTM_API.Services;
using CSTM_API.Mappers;
using Azure.Identity;
using CSTM_API.Services.Messaging;

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
    opt.UseSqlServer(connectionString, sql => sql.EnableRetryOnFailure(
        maxRetryCount: 6,
        maxRetryDelay: TimeSpan.FromSeconds(20),
        errorNumbersToAdd: null
    ));
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

builder.Services.Configure<ServiceBusOptions>(builder.Configuration.GetSection(ServiceBusOptions.SectionName));
var serviceBusOptions = builder.Configuration.GetSection(ServiceBusOptions.SectionName).Get<ServiceBusOptions>() ?? new ServiceBusOptions();

if(serviceBusOptions.Enabled)
{
    builder.Services.AddSingleton(_ =>  serviceBusOptions.CreateClient());
    builder.Services.AddSingleton<ITicketEventPublisher, ServiceBusTicketEventPublisher>();
    builder.Services.AddHostedService<TicketEventsConsumer>();
}
else
{
    builder.Services.AddSingleton<ITicketEventPublisher, LoggingTicketEventPublisher>();
}

const string FrontendCorsPolicy = "FrontendCorsPolicy";

builder.Services.AddCors(opt => {
    opt.AddPolicy(FrontendCorsPolicy, policy =>
    {
        var allowedOrgins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
        ?? new[] { "http://localhost:5173" };

        policy.WithOrigins(allowedOrgins)
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

var app = builder.Build();

await IdentitySeeder.SeedRolesAsync(app.Services);

await IdentitySeeder.SeedDefaultAdminAsync(app.Services, app.Configuration);

if (app.Environment.IsDevelopment())
{
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