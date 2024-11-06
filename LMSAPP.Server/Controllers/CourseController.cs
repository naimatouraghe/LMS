using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using LMSAPP.Server.DTOs;
using LMSAPP.Server.Services.Interfaces;

namespace LMSAPP.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CourseController : ControllerBase
    {
        private readonly ICourseService _courseService;

        public CourseController(ICourseService courseService)
        {
            _courseService = courseService;
        }

        [HttpPost]
        [Authorize(Roles = "Teacher")]
        public async Task<IResult> CreateCourse([FromBody] CourseDto courseDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException("User not authenticated");
            return await _courseService.CreateCourseAsync(courseDto, userId);
        }

        [HttpGet]
        public async Task<IResult> GetCourses([FromQuery] string? searchTerm, [FromQuery] string? category)
        {
            return await _courseService.GetAllCoursesAsync(searchTerm, category);
        }

        [HttpGet("{courseId}")]
        public async Task<IResult> GetCourse(Guid courseId)
        {
            return await _courseService.GetCourseAsync(courseId);
        }

        [HttpPut("{courseId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IResult> UpdateCourse(Guid courseId, [FromBody] CourseDto courseDto)
        {
            return await _courseService.UpdateCourseAsync(courseId, courseDto);
        }

        [HttpDelete("{courseId}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IResult> DeleteCourse(Guid courseId)
        {
            return await _courseService.DeleteCourseAsync(courseId);
        }

        [HttpGet("user/{userId}")]
        [Authorize]
        public async Task<IResult> GetUserCourses(string userId)
        {
            return await _courseService.GetUserCoursesAsync(userId);
        }

        // Chapter Management
        [HttpPost("{courseId}/chapters")]
        [Authorize(Roles = "Teacher")]
        public async Task<IResult> AddChapter(Guid courseId, [FromBody] ChapterDto chapterDto)
        {
            return await _courseService.AddChapterAsync(courseId, chapterDto);
        }

        [HttpPut("chapters/{chapterId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IResult> UpdateChapter(Guid chapterId, [FromBody] ChapterDto chapterDto)
        {
            return await _courseService.UpdateChapterAsync(chapterId, chapterDto);
        }

        [HttpDelete("chapters/{chapterId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IResult> DeleteChapter(Guid chapterId)
        {
            return await _courseService.DeleteChapterAsync(chapterId);
        }

        [HttpPut("{courseId}/chapters/reorder")]
        [Authorize(Roles = "Teacher")]
        public async Task<IResult> ReorderChapters(Guid courseId, [FromBody] List<Guid> chapterIds)
        {
            return await _courseService.ReorderChaptersAsync(courseId, chapterIds);
        }

        [HttpGet("{courseId}/chapters")]
        public async Task<IResult> GetCourseChapters(Guid courseId)
        {
            return await _courseService.GetCourseChaptersAsync(courseId);
        }

        // Attachments
        [HttpPost("{courseId}/attachments")]
        [Authorize(Roles = "Teacher")]
        public async Task<IResult> AddAttachment(Guid courseId, IFormFile file)
        {
            return await _courseService.AddAttachmentAsync(courseId, file);
        }

        [HttpDelete("attachments/{attachmentId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IResult> DeleteAttachment(Guid attachmentId)
        {
            return await _courseService.DeleteAttachmentAsync(attachmentId);
        }

        [HttpGet("{courseId}/attachments")]
        public async Task<IResult> GetCourseAttachments(Guid courseId)
        {
            return await _courseService.GetCourseAttachmentsAsync(courseId);
        }

        // Categories
        [HttpGet("categories")]
        public async Task<IResult> GetCategories()
        {
            return await _courseService.GetCategoriesAsync();
        }

        [HttpPost("categories")]
        [Authorize(Roles = "Admin")]
        public async Task<IResult> CreateCategory([FromBody] CategoryDto categoryDto)
        {
            return await _courseService.CreateCategoryAsync(categoryDto);
        }

        [HttpPut("categories/{categoryId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IResult> UpdateCategory(Guid categoryId, [FromBody] CategoryDto categoryDto)
        {
            return await _courseService.UpdateCategoryAsync(categoryId, categoryDto);
        }

        [HttpDelete("categories/{categoryId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IResult> DeleteCategory(Guid categoryId)
        {
            return await _courseService.DeleteCategoryAsync(categoryId);
        }

        // Analytics and Progress
        [HttpGet("analytics/teacher")]
        [Authorize(Roles = "Teacher")]
        public async Task<IResult> GetTeacherAnalytics()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException("User not authenticated");
            return await _courseService.GetTeacherAnalyticsAsync(userId);
        }

        [HttpGet("purchased")]
        [Authorize]
        public async Task<IResult> GetPurchasedCourses()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException("User not authenticated");
            return await _courseService.GetPurchasedCoursesAsync(userId);
        }

        [HttpGet("{courseId}/progress")]
        [Authorize]
        public async Task<IResult> GetCourseProgress(Guid courseId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException("User not authenticated");
            return await _courseService.GetCourseProgressAsync(userId, courseId);
        }

        [HttpGet("{courseId}/purchased")]
        [Authorize]
        public async Task<IResult> HasUserPurchasedCourse(Guid courseId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException("User not authenticated");
            var result = await _courseService.HasUserPurchasedCourseAsync(userId, courseId);
            return Results.Ok(result);
        }
    }
}
