using CSTM_API.Enum;

namespace CSTM_API.DTO_s.Requests
{
    public sealed class TicketFilterParameters
    {
        public string? Title { get; init; }
        public string? Description { get; init; }
        public string? ServiceName { get; init; }

        public Severity? Severity { get; init; }
        public Status? Status { get; init; }

        public string? CreatedByUserId { get; init; }
        public string? AssignedToUserId { get; init; }

        public DateTime? CreatedAtFrom { get; init; }
        public DateTime? CreatedAtTo { get; init; }

        public DateTime? UpdatedAtFrom { get; init; }
        public DateTime? UpdatedAtTo { get; init; }

        public DateTime? ResolvedAtFrom { get; init; }
        public DateTime? ResolvedAtTo { get; init; }

        public int Page { get; init; } = 1;
        public int PageCount { get; init; } = 20;
    }
}