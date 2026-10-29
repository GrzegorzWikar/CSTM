namespace CSTM_API.Services
{
    public enum RoleChangeDecision
    {
        Allowed,
        InvalidRole,
        CannotChangeOwnRole,
        Forbidden
    }

    public static class RoleChangePolicy
    {
        public const string UserRole = "User";
        public const string SupportRole = "Support";
        public const string AdminRole = "Admin";

        public static readonly string[] AllRoles = [UserRole, SupportRole, AdminRole];

        public static RoleChangeDecision Evaluate(
            IEnumerable<string> actorRoles,
            string actorId,
            string targetId,
            IEnumerable<string> targetRoles,
            string newRole)
        {
            if (!AllRoles.Contains(newRole))
            {
                return RoleChangeDecision.InvalidRole;
            }
            
            if (actorId == targetId)
            {
                return RoleChangeDecision.CannotChangeOwnRole;
            }

            if (actorRoles.Contains(AdminRole))
            {
                return RoleChangeDecision.Allowed;
            }

            if (actorRoles.Contains(SupportRole) && newRole == SupportRole && !targetRoles.Contains(SupportRole) && !targetRoles.Contains(AdminRole))
            {
                return RoleChangeDecision.Allowed;
            }

            return RoleChangeDecision.Forbidden;
        }
    }
}