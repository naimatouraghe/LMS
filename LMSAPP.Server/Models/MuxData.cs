namespace lmsapp.Server.Models
{
    public class MuxData
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string AssetId { get; set; }
        public string? PlaybackId { get; set; }

        public string ChapterId { get; set; }
        public Chapter Chapter { get; set; }
    }

}
