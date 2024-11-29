using LMSAPP.Server.DTOs;

namespace LMSAPP.Server.Services.Interfaces
{
    public interface ICourseService
    {
        // Course CRUD
        Task<IResult> CreateCourseAsync(CourseDto courseDto, string userId);
        Task<IResult> GetCourseAsync(Guid courseId);
        Task<IResult> UpdateCourseAsync(Guid courseId, CourseDto courseDto);
        Task<IResult> DeleteCourseAsync(Guid courseId);
        Task<IResult> GetAllCoursesAsync(
            string? searchTerm = null,
            string? category = null,
            int? level = null,
            string? priceRange = null,
            string? sort = null
        );
        Task<IResult> GetUserCoursesAsync(string userId);

        // Chapter Management
        Task<IResult> AddChapterAsync(Guid courseId, CreateChapterDto createChapterDto);
        Task<IResult> UpdateChapterAsync(Guid chapterId, ChapterDto chapterDto);
        Task<IResult> DeleteChapterAsync(Guid chapterId);
        Task<IResult> ReorderChaptersAsync(Guid courseId, List<Guid> chapterIds);
        Task<IResult> GetCourseChaptersAsync(Guid courseId);

        // Attachments
        Task<IResult> AddAttachmentAsync(Guid courseId, IFormFile file);
        Task<IResult> DeleteAttachmentAsync(Guid attachmentId);
        Task<IResult> GetCourseAttachmentsAsync(Guid courseId);

        // Categories
        Task<IResult> GetCategoriesAsync();
        Task<IResult> CreateCategoryAsync(CategoryDto categoryDto);
        Task<IResult> UpdateCategoryAsync(Guid categoryId, CategoryDto categoryDto);
        Task<IResult> DeleteCategoryAsync(Guid categoryId);

        // Teacher Analytics
        Task<IResult> GetTeacherAnalyticsAsync(string userId);

        // Course Access & Purchase
        Task<IResult> GetPurchasedCoursesAsync(string userId);
        Task<bool> HasUserPurchasedCourseAsync(string userId, Guid courseId);
        Task<IResult> GetCourseProgressAsync(string userId, Guid courseId);

        // Ajoutez cette méthode
        Task<IResult> CreateInitialCourseAsync(InitialCourseDto initialCourseDto, string userId);
    }
}