namespace LMSAPP.Server.DTOs
{
    public class AttachmentDto
    {
        public string Id { get; set; }  // Reste en string pour l'API
        public string Name { get; set; }
        public string Url { get; set; }
        public string CourseId { get; set; } 
    }
}