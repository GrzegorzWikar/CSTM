using CSTM_API.Services;

namespace CSTM_API.Tests
{
    public class RoleChangePolicyTests
    {
        private static string[] Split(string roles) => roles.Split(',', StringSplitOptions.RemoveEmptyEntries);

        private static RoleChangeDecision Evaluate(string actorRoles, string targetRoles, string newRole) => RoleChangePolicy.Evaluate(Split(actorRoles), "actor-1", "target-1", Split(targetRoles), newRole);

        [Theory]
        [InlineData("Admin", "User", "Support", RoleChangeDecision.Allowed)]
        [InlineData("Admin", "User", "Admin", RoleChangeDecision.Allowed)]
        [InlineData("Admin", "Support", "Admin", RoleChangeDecision.Allowed)]
        [InlineData("Admin", "Support", "User", RoleChangeDecision.Allowed)]
        [InlineData("Admin", "Admin", "User", RoleChangeDecision.Allowed)]
        // Support moze awansowac tylko zwyklego uzytkownika do Support.
        [InlineData("Support", "User", "Support", RoleChangeDecision.Allowed)]
        [InlineData("Support", "", "Support", RoleChangeDecision.Allowed)]
        [InlineData("Support", "User", "Admin", RoleChangeDecision.Forbidden)]
        [InlineData("Support", "Support", "Admin", RoleChangeDecision.Forbidden)]
        [InlineData("Support", "Support", "User", RoleChangeDecision.Forbidden)]
        [InlineData("Support", "Support", "Support", RoleChangeDecision.Forbidden)]
        [InlineData("Support", "Admin", "Support", RoleChangeDecision.Forbidden)]
        [InlineData("Support", "Admin", "User", RoleChangeDecision.Forbidden)]
        [InlineData("Support", "User", "User", RoleChangeDecision.Forbidden)]
        // Zwykly uzytkownik (albo konto bez roli) nie zmienia niczego.
        [InlineData("User", "User", "Support", RoleChangeDecision.Forbidden)]
        [InlineData("User", "User", "Admin", RoleChangeDecision.Forbidden)]
        [InlineData("", "User", "Support", RoleChangeDecision.Forbidden)]
        public void Evaluate_ReturnsExpectedDecision(string actorRoles, string targetRoles, string newRole, RoleChangeDecision expected)
        {
            Assert.Equal(expected, Evaluate(actorRoles, targetRoles, newRole));
        }

        [Fact]
        public void Evaluate_SupportWhoIsAlsoAdmin_ActsAsAdmin()
        {
            Assert.Equal(RoleChangeDecision.Allowed, Evaluate("Support,Admin","User","Admin"));
        }

        [Theory]
        [InlineData("Admin","Support")]
        [InlineData("Admin","User")]
        [InlineData("Support","Support")]
        public void Evaluate_ChangingOwnRole_IsRejected(string roles, string newRole)
        {
            var result = RoleChangePolicy.Evaluate(Split(roles), "same-id", "same-id", Split(roles), newRole);

            Assert.Equal(RoleChangeDecision.CannotChangeOwnRole, result);
        }

        [Theory]
        [InlineData("Root")]
        [InlineData("support")]
        [InlineData("")]
        public void Evaluate_UnknownRole_IsInvalidEvenForAdmin(string newRole)
        {
            Assert.Equal(RoleChangeDecision.InvalidRole, Evaluate("Admin", "User", newRole));
        }
    }
}