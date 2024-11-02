namespace LMSAPP.Server.DTOs
{
    public class PurchaseDto
{
    public string Id { get; set; }  
    public string UserId { get; set; }
    public string CourseId { get; set; }  
   
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public CourseDto Course { get; set; }
}
}