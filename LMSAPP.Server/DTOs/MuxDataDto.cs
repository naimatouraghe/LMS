namespace LMSAPP.Server.DTOs
{
    public class MuxDataDto
    {
        public Guid Id { get; set; }
        public required string AssetId { get; set; }
        public string? PlaybackId { get; set; }
        public Guid ChapterId { get; set; }
        public required ChapterDto Chapter { get; set; }
    }
}