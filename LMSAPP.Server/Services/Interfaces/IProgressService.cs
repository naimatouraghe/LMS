using LMSAPP.Server.DTOs;

namespace LMSAPP.Server.Services.Interfaces
{
    public interface IProgressService
    {
        Task<IResult> CreateUserProgress(UserProgressDto progressDto);
        Task<IResult> GetUserProgress(Guid progressId);
        Task<IResult> UpdateUserProgress(Guid progressId, UserProgressDto progressDto);
        Task<IResult> DeleteUserProgress(Guid progressId);

        Task<IResult> MarkChapterAsCompleted(string userId, Guid chapterId);
        Task<IResult> UnmarkChapterAsCompleted(string userId, Guid chapterId);

        Task<IResult> GetCourseProgress(string userId, Guid courseId);
        Task<IResult> GetAllUserProgress(string userId);
        Task<double> GetCourseCompletionPercentage(string userId, Guid courseId);
    }
}