using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LMSAPP.Server.Models
{
    public class MuxData
    {
        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Asset ID is required")]
        [StringLength(100, ErrorMessage = "Asset ID cannot exceed 100 characters")]
        public required string AssetId { get; set; }

        [StringLength(100, ErrorMessage = "Playback ID cannot exceed 100 characters")]
        public string? PlaybackId { get; set; }

        [Required(ErrorMessage = "Chapter ID is required")]
        public Guid ChapterId { get; set; }

        [ForeignKey("ChapterId")]
        public required Chapter Chapter { get; set; }
    }
}
