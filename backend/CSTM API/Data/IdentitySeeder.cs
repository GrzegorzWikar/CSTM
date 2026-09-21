using Microsoft.AspNetCore.Identity;

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
    }
}
