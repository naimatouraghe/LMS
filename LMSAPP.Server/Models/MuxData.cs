namespace lmsapp.Server.Models
{
    public class MuxData
    {
        public Guid Id { get; set; } 
        public string AssetId { get; set; }
        public string? PlaybackId { get; set; }

        public Guid ChapterId { get; set; }
        public Chapter Chapter { get; set; }
    }

}
