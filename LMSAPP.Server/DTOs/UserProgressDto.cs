namespace LMSAPP.Server.DTOs
{
    public class UserProgressDto
{
    public string Id { get; set; } 
    public string UserId { get; set; }
    public string ChapterId { get; set; }  
    public bool IsCompleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
}