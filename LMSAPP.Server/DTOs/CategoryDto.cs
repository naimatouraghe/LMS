namespace LMSAPP.Server.DTOs
{
    public class CategoryDto
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required ICollection<CourseDto> Courses { get; set; }
    }
}