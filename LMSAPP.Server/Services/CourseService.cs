using LMSAPP.Server.Data;
using LMSAPP.Server.DTOs;
using LMSAPP.Server.Models;
using LMSAPP.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LMSAPP.Server.Services
{
    public class CourseService : ICourseService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CourseService> _logger;
        private readonly IWebHostEnvironment _environment;

        public CourseService(
            ApplicationDbContext context,
            ILogger<CourseService> logger,
            IWebHostEnvironment environment)
        {
            _context = context;
            _logger = logger;
            _environment = environment;
        }

        public async Task<IResult> CreateCourseAsync(CourseDto courseDto, string userId)
        {
            try
            {
                var category = await _context.Categories.FindAsync(courseDto.CategoryId);
                if (category == null)
                {
                    return Results.BadRequest("Category not found");
                }

                var teacher = await _context.Users.FindAsync(userId);
                if (teacher == null)
                {
                    return Results.BadRequest("Teacher not found");
                }

                var course = new Course
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Teacher = teacher,
                    Title = courseDto.Title,
                    Description = courseDto.Description,
                    ImageUrl = courseDto.ImageUrl,
                    Price = courseDto.Price,
                    IsPublished = courseDto.IsPublished,
                    CategoryId = courseDto.CategoryId,
                    Category = category,
                    Level = courseDto.Level,
                    Chapters = new List<Chapter>(),
                    Attachments = new List<Attachment>(),
                    Purchases = new List<Purchase>(),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Courses.Add(course);
                await _context.SaveChangesAsync();

                var createdCourse = await GetCourseWithDetailsAsync(course.Id);
                return Results.Ok(createdCourse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating course");
                return Results.Problem("An error occurred while creating the course");
            }
        }

        public async Task<IResult> GetCourseAsync(Guid courseId)
        {
            try
            {
                var courseDto = await GetCourseWithDetailsAsync(courseId);
                if (courseDto == null)
                {
                    return Results.NotFound("Course not found");
                }

                return Results.Ok(courseDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting course");
                return Results.Problem("An error occurred while getting the course");
            }
        }

        public async Task<IResult> UpdateCourseAsync(Guid courseId, CourseDto courseDto)
        {
            try
            {
                var course = await _context.Courses.FindAsync(courseId);
                if (course == null)
                {
                    return Results.NotFound("Course not found");
                }

                course.Title = courseDto.Title;
                course.Description = courseDto.Description;
                course.ImageUrl = courseDto.ImageUrl;
                course.Price = courseDto.Price;
                course.IsPublished = courseDto.IsPublished;
                course.CategoryId = courseDto.CategoryId;
                course.Level = courseDto.Level;
                course.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var updatedCourse = await GetCourseWithDetailsAsync(courseId);
                return Results.Ok(updatedCourse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating course");
                return Results.Problem("An error occurred while updating the course");
            }
        }

        public async Task<IResult> GetAllCoursesAsync(string? searchTerm = null, string? category = null)
        {
            try
            {
                IQueryable<Course> query = _context.Courses
                    .Include(c => c.Category)
                    .Include(c => c.Chapters)
                    .Include(c => c.Attachments)
                    .Include(c => c.Purchases);

                if (!string.IsNullOrEmpty(searchTerm))
                {
                    searchTerm = searchTerm.ToLower();
                    query = query.Where(c =>
                        (c.Title != null && c.Title.ToLower().Contains(searchTerm)) ||
                        (c.Description != null && c.Description.ToLower().Contains(searchTerm)));
                }

                if (!string.IsNullOrEmpty(category))
                {
                    query = query.Where(c => c.Category.Name.ToLower() == category.ToLower());
                }

                var courses = await query.ToListAsync();
                var courseDtos = courses.Select(MapCourseToDto).ToList();

                return Results.Ok(courseDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting courses");
                return Results.Problem("An error occurred while getting courses");
            }
        }

        // Méthode utilitaire pour mapper Course vers CourseDto
        private CourseDto MapCourseToDto(Course course)
        {
            return new CourseDto
            {
                Id = course.Id,
                UserId = course.UserId,
                Title = course.Title,
                Description = course.Description,
                ImageUrl = course.ImageUrl,
                Price = course.Price,
                IsPublished = course.IsPublished,
                CategoryId = course.CategoryId,
                Category = new CategoryDto
                {
                    Id = course.Category.Id,
                    Name = course.Category.Name,
                    Courses = new List<CourseDto>() // Éviter la référence circulaire
                },
                Level = course.Level,
                Chapters = course.Chapters.Select(ch => new ChapterDto
                {
                    Id = ch.Id,
                    Title = ch.Title,
                    Description = ch.Description,
                    VideoUrl = ch.VideoUrl,
                    Position = ch.Position,
                    IsPublished = ch.IsPublished,
                    IsFree = ch.IsFree,
                    CourseId = ch.CourseId,
                    Course = null!, // Éviter la référence circulaire
                    MuxData = ch.MuxData != null ? new MuxDataDto
                    {
                        AssetId = ch.MuxData.AssetId,
                        PlaybackId = ch.MuxData.PlaybackId,
                        Chapter = null!
                    } : null,
                    UserProgress = new List<UserProgressDto>(),
                    CreatedAt = ch.CreatedAt,
                    UpdatedAt = ch.UpdatedAt
                }).ToList(),
                Attachments = course.Attachments.Select(a => new AttachmentDto
                {
                    Id = a.Id,
                    Name = a.Name,
                    Url = a.Url,
                    CourseId = a.CourseId,
                    Course = null!, // Éviter la référence circulaire
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt
                }).ToList(),
                Purchases = course.Purchases.Select(p => new PurchaseDto
                {
                    Id = p.Id,
                    UserId = p.UserId,
                    User = null!, // Éviter la référence circulaire
                    CourseId = p.CourseId,
                    Course = null!, // Éviter la référence circulaire
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt
                }).ToList(),
                CreatedAt = course.CreatedAt,
                UpdatedAt = course.UpdatedAt
            };
        }

        private async Task<CourseDto?> GetCourseWithDetailsAsync(Guid courseId)
        {
            var course = await _context.Courses
                .Include(c => c.Category)
                .Include(c => c.Teacher)
                .Include(c => c.Chapters.OrderBy(ch => ch.Position))
                .Include(c => c.Attachments)
                .Include(c => c.Purchases)
                .FirstOrDefaultAsync(c => c.Id == courseId);

            if (course == null) return null;

            return new CourseDto
            {
                Id = course.Id,
                UserId = course.UserId,
                Title = course.Title,
                Description = course.Description,
                ImageUrl = course.ImageUrl,
                Price = course.Price,
                IsPublished = course.IsPublished,
                CategoryId = course.CategoryId,
                Category = new CategoryDto
                {
                    Id = course.Category.Id,
                    Name = course.Category.Name,
                    Courses = new List<CourseDto>() // Éviter la référence circulaire
                },
                Level = course.Level,
                Chapters = course.Chapters.Select(ch => new ChapterDto
                {
                    Id = ch.Id,
                    Title = ch.Title,
                    Description = ch.Description,
                    VideoUrl = ch.VideoUrl,
                    Position = ch.Position,
                    IsPublished = ch.IsPublished,
                    IsFree = ch.IsFree,
                    CourseId = ch.CourseId,
                    Course = null!, // Éviter la référence circulaire
                    MuxData = ch.MuxData != null ? new MuxDataDto
                    {
                        AssetId = ch.MuxData.AssetId,
                        PlaybackId = ch.MuxData.PlaybackId,
                        Chapter = null!
                    } : null,
                    UserProgress = new List<UserProgressDto>(),
                    CreatedAt = ch.CreatedAt,
                    UpdatedAt = ch.UpdatedAt
                }).ToList(),
                Attachments = course.Attachments.Select(a => new AttachmentDto
                {
                    Id = a.Id,
                    Name = a.Name,
                    Url = a.Url,
                    CourseId = a.CourseId,
                    Course = null!, // Éviter la référence circulaire
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt
                }).ToList(),
                Purchases = course.Purchases.Select(p => new PurchaseDto
                {
                    Id = p.Id,
                    UserId = p.UserId,
                    User = null!, // Éviter la référence circulaire
                    CourseId = p.CourseId,
                    Course = null!, // Éviter la référence circulaire
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt
                }).ToList(),
                CreatedAt = course.CreatedAt,
                UpdatedAt = course.UpdatedAt
            };
        }

        public Task<IResult> DeleteCourseAsync(Guid courseId)
        {
            throw new NotImplementedException();
        }

        public Task<IResult> GetUserCoursesAsync(string userId)
        {
            throw new NotImplementedException();
        }

        public Task<IResult> AddChapterAsync(Guid courseId, ChapterDto chapterDto)
        {
            throw new NotImplementedException();
        }

        public Task<IResult> UpdateChapterAsync(Guid chapterId, ChapterDto chapterDto)
        {
            throw new NotImplementedException();
        }

        public Task<IResult> DeleteChapterAsync(Guid chapterId)
        {
            throw new NotImplementedException();
        }

        public Task<IResult> ReorderChaptersAsync(Guid courseId, List<Guid> chapterIds)
        {
            throw new NotImplementedException();
        }

        public Task<IResult> GetCourseChaptersAsync(Guid courseId)
        {
            throw new NotImplementedException();
        }

        public Task<IResult> AddAttachmentAsync(Guid courseId, IFormFile file)
        {
            throw new NotImplementedException();
        }

        public Task<IResult> DeleteAttachmentAsync(Guid attachmentId)
        {
            throw new NotImplementedException();
        }

        public Task<IResult> GetCourseAttachmentsAsync(Guid courseId)
        {
            throw new NotImplementedException();
        }

        public Task<IResult> GetCategoriesAsync()
        {
            throw new NotImplementedException();
        }

        public Task<IResult> CreateCategoryAsync(CategoryDto categoryDto)
        {
            throw new NotImplementedException();
        }

        public Task<IResult> UpdateCategoryAsync(Guid categoryId, CategoryDto categoryDto)
        {
            throw new NotImplementedException();
        }

        public Task<IResult> DeleteCategoryAsync(Guid categoryId)
        {
            throw new NotImplementedException();
        }

        public Task<IResult> GetTeacherAnalyticsAsync(string userId)
        {
            throw new NotImplementedException();
        }

        public Task<IResult> GetPurchasedCoursesAsync(string userId)
        {
            throw new NotImplementedException();
        }

        public Task<bool> HasUserPurchasedCourseAsync(string userId, Guid courseId)
        {
            throw new NotImplementedException();
        }

        public Task<IResult> GetCourseProgressAsync(string userId, Guid courseId)
        {
            throw new NotImplementedException();
        }

        // Voulez-vous que je continue avec les autres méthodes ?
    }
}
