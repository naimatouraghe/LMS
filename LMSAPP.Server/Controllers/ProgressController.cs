using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using LMSAPP.Server.DTOs;
using LMSAPP.Server.Services.Interfaces;

namespace LMSAPP.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProgressController : ControllerBase
    {
        private readonly IProgressService _progressService;

        public ProgressController(IProgressService progressService)
        {
            _progressService = progressService;
        }

        [Authorize]
        [HttpPost]
        public async Task<IResult> CreateProgress([FromBody] UserProgressDto progressDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException("User not authenticated");
            progressDto.UserId = userId;
            return await _progressService.CreateUserProgress(progressDto);
        }

        [Authorize]
        [HttpGet("{progressId}")]
        public async Task<IResult> GetProgress(Guid progressId)
        {
            return await _progressService.GetUserProgress(progressId);
        }

        [Authorize]
        [HttpPut("{progressId}")]
        public async Task<IResult> UpdateProgress(Guid progressId, [FromBody] UserProgressDto progressDto)
        {
            return await _progressService.UpdateUserProgress(progressId, progressDto);
        }

        [Authorize]
        [HttpDelete("{progressId}")]
        public async Task<IResult> DeleteProgress(Guid progressId)
        {
            return await _progressService.DeleteUserProgress(progressId);
        }

        [Authorize]
        [HttpPost("chapters/{chapterId}/complete")]
        public async Task<IResult> MarkChapterAsCompleted(Guid chapterId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException("User not authenticated");
            return await _progressService.MarkChapterAsCompleted(userId, chapterId);
        }

        [Authorize]
        [HttpPost("chapters/{chapterId}/uncomplete")]
        public async Task<IResult> UnmarkChapterAsCompleted(Guid chapterId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException("User not authenticated");
            return await _progressService.UnmarkChapterAsCompleted(userId, chapterId);
        }

        [Authorize]
        [HttpGet("courses/{courseId}")]
        public async Task<IResult> GetCourseProgress(Guid courseId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException("User not authenticated");
            return await _progressService.GetCourseProgress(userId, courseId);
        }

        [Authorize]
        [HttpGet]
        public async Task<IResult> GetAllProgress()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException("User not authenticated");
            return await _progressService.GetAllUserProgress(userId);
        }

        [Authorize]
        [HttpGet("courses/{courseId}/percentage")]
        public async Task<IResult> GetCourseCompletionPercentage(Guid courseId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException("User not authenticated");
            var percentage = await _progressService.GetCourseCompletionPercentage(userId, courseId);
            return Results.Ok(new { CompletionPercentage = percentage });
        }
    }
}
