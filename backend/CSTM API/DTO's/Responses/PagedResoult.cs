namespace CSTM_API.DTO_s.Responses
{
    public sealed class PagedResoult<T>(IReadOnlyCollection<T> items, int page, int pageSize, int totalCount, int totalPages)
    {
        public IEnumerable<T> Items { get; init; } = items;
        public int Page { get; init; } = page;
        public int PageSize { get; init; } = pageSize;
        public int TotalCount { get; init; } = totalCount;
        public int TotalPages { get; init; } = totalPages;
    } 
}
