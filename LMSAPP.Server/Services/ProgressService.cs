using LMSAPP.Server.Data;
using LMSAPP.Server.DTOs;
using LMSAPP.Server.Models;
using LMSAPP.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LMSAPP.Server.Services
{
    public class ProgressService : IProgressService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ProgressService> _logger;

        public ProgressService(
            ApplicationDbContext context,
            ILogger<ProgressService> logger)
        {
            _context = context;
            _logger = logger;
        }

        private static UserProgressDto MapToDto(UserProgress progress)
        {
            return new UserProgressDto
            {
                Id = progress.Id,
                UserId = progress.UserId,
                User = new UserDto
                {
                    Id = progress.User?.Id ?? progress.UserId,
                    Email = progress.User?.Email ?? "unknown@email.com",
                    FullName = progress.User?.FullName ?? "Unknown",
                    Purchases = new List<PurchaseDto>(),
                    UserProgress = new List<UserProgressDto>()
                },
                ChapterId = progress.ChapterId,
                Chapter = new ChapterDto
                {
                    Id = progress.Chapter.Id,
                    Title = progress.Chapter.Title,
                    Description = progress.Chapter.Description,
                    VideoUrl = progress.Chapter.VideoUrl,
                    Position = progress.Chapter.Position,
                    IsPublished = progress.Chapter.IsPublished,
                    IsFree = progress.Chapter.IsFree,
                    CourseId = progress.Chapter.CourseId,
                    Course = new CourseDto
                    {
                        UserId = progress.Chapter.Course?.UserId ?? string.Empty,
                        Title = progress.Chapter.Course?.Title ?? string.Empty,
                        Attachments = new List<AttachmentDto>(),
                        Category = new CategoryDto
                        {
                            Id = progress.Chapter.Course?.Category?.Id ?? Guid.Empty,
                            Name = progress.Chapter.Course?.Category?.Name ?? string.Empty,
                            Courses = new List<CourseDto>()
                        },
                        Chapters = new List<ChapterDto>(),
                        Purchases = new List<PurchaseDto>(),

                    },
                    UserProgress = new List<UserProgressDto>()
                },
                IsCompleted = progress.IsCompleted,
                CreatedAt = progress.CreatedAt,
                UpdatedAt = progress.UpdatedAt
            };
        }

        public async Task<IResult> CreateUserProgress(UserProgressDto progressDto)
        {
            try
            {
                var progress = new UserProgress
                {
                    Id = Guid.NewGuid(),
                    UserId = progressDto.UserId,
                    ChapterId = progressDto.ChapterId,
                    IsCompleted = progressDto.IsCompleted,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    User = await _context.Users.FindAsync(progressDto.UserId),
                    Chapter = await _context.Chapters.FindAsync(progressDto.ChapterId)
                };

                _context.UserProgresses.Add(progress);
                await _context.SaveChangesAsync();

                return Results.Ok(MapToDto(progress));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user progress");
                return Results.Problem("An error occurred while creating user progress");
            }
        }

        public async Task<IResult> GetUserProgress(Guid progressId)
        {
            try
            {
                var progress = await _context.UserProgresses
                    .Include(up => up.Chapter)
                    .Include(up => up.User)
                    .FirstOrDefaultAsync(up => up.Id == progressId);

                if (progress == null)
                {
                    return Results.NotFound("User progress not found");
                }

                return Results.Ok(MapToDto(progress));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user progress");
                return Results.Problem("An error occurred while getting user progress");
            }
        }

        public async Task<IResult> UpdateUserProgress(Guid progressId, UserProgressDto progressDto)
        {
            try
            {
                var progress = await _context.UserProgresses.FindAsync(progressId);
                if (progress == null)
                {
                    return Results.NotFound("User progress not found");
                }

                progress.IsCompleted = progressDto.IsCompleted;
                progress.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return Results.Ok(MapToDto(progress));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user progress");
                return Results.Problem("An error occurred while updating user progress");
            }
        }

        public async Task<IResult> MarkChapterAsCompleted(string userId, Guid chapterId)
        {
            try
            {
                var progress = await _context.UserProgresses
                    .FirstOrDefaultAsync(up => up.UserId == userId && up.ChapterId == chapterId);

                if (progress == null)
                {
                    var user = await _context.Users.FindAsync(userId)
                        ?? throw new InvalidOperationException("User not found");
                    var chapter = await _context.Chapters.FindAsync(chapterId)
                        ?? throw new InvalidOperationException("Chapter not found");

                    progress = new UserProgress
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        ChapterId = chapterId,
                        IsCompleted = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        User = user,
                        Chapter = chapter
                    };
                    _context.UserProgresses.Add(progress);
                }
                else
                {
                    progress.IsCompleted = true;
                    progress.UpdatedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();
                return Results.Ok(MapToDto(progress));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking chapter as completed");
                return Results.Problem("An error occurred while marking the chapter as completed");
            }
        }

        public async Task<IResult> GetCourseProgress(string userId, Guid courseId)
        {
            try
            {
                var progress = await _context.UserProgresses
                    .Include(up => up.Chapter)
                    .Where(up => up.UserId == userId &&
                           up.Chapter.CourseId == courseId)
                    .Select(up => MapToDto(up))
                    .ToListAsync();

                var completionPercentage = await GetCourseCompletionPercentage(userId, courseId);

                return Results.Ok(new
                {
                    Progress = progress,
                    CompletionPercentage = completionPercentage
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting course progress");
                return Results.Problem("An error occurred while getting course progress");
            }
        }

        public async Task<IResult> GetAllUserProgress(string userId)
        {
            try
            {
                var progress = await _context.UserProgresses
                    .Include(up => up.Chapter)
                        .ThenInclude(c => c.Course)
                    .Include(up => up.User)
                    .Where(up => up.UserId == userId)
                    .Select(up => MapToDto(up))
                    .ToListAsync();

                return Results.Ok(progress);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all user progress");
                return Results.Problem("An error occurred while getting user progress");
            }
        }

        public async Task<IResult> DeleteUserProgress(Guid progressId)
        {
            try
            {
                var progress = await _context.UserProgresses.FindAsync(progressId);
                if (progress == null)
                {
                    return Results.NotFound("User progress not found");
                }

                _context.UserProgresses.Remove(progress);
                await _context.SaveChangesAsync();

                return Results.Ok(new { Message = "Progress deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user progress");
                return Results.Problem("An error occurred while deleting user progress");
            }
        }

        public async Task<double> GetCourseCompletionPercentage(string userId, Guid courseId)
        {
            var totalChapters = await _context.Chapters
                .CountAsync(c => c.CourseId == courseId);

            if (totalChapters == 0)
            {
                return 0;
            }

            var completedChapters = await _context.UserProgresses
                .CountAsync(up => up.UserId == userId &&
                           up.Chapter.CourseId == courseId &&
                           up.IsCompleted);

            return Math.Round((double)completedChapters / totalChapters * 100, 2);
        }

        public Task<IResult> UnmarkChapterAsCompleted(string userId, Guid chapterId)
        {
            throw new NotImplementedException();
        }
    }
}