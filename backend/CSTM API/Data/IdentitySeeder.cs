using Microsoft.AspNetCore.Identity;
using CSTM_API.Models;

namespace CSTM_API.Data
{
    public static class IdentitySeeder
    {
        public static async Task SeedRolesAsync(IServiceProvider services)
        {
            using var scope = services.CreateScope();

            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            string[] roles =
                [
                    "User",
                    "Support",
                    "Admin"
                ];

            foreach (var roleName in roles)
            {
                var roleExists = await roleManager.RoleExistsAsync(roleName);

                if (!roleExists) 
                {
                    var result = await roleManager.CreateAsync(new IdentityRole(roleName));

                    if (!result.Succeeded)
                    {
                        var errors = string.Join(", ", result.Errors.Select(e => e.Description));

                        throw new InvalidOperationException($"Role '{roleName}' was not created because: {errors}");
                    }
                }
                
            }
        }

        public static async Task SeedDefaultAdminAsync(IServiceProvider services, IConfiguration configuration)
        {
            var adminEmail = configuration["Seed:AdminEmail"];
            var adminPassword = configuration["Seed:AdminPassword"];

            if(string.IsNullOrWhiteSpace(adminEmail) || string.IsNullOrWhiteSpace(adminPassword))
            {
                return;
            }

            using var scope = services.CreateScope();

            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

            var admins = await userManager.GetUsersInRoleAsync("Admin");

            if (admins.Count > 0)
            {
                return;
            }

            var existingUser = await userManager.FindByEmailAsync(adminEmail);

            if(existingUser is not null)
            {
                await userManager.AddToRoleAsync(existingUser, "Admin");
                return;
            }

            var adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(adminUser, adminPassword);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Default Admin was not created: {errors}");
            }

            await userManager.AddToRoleAsync(adminUser, "Admin");
        }
    }
}
