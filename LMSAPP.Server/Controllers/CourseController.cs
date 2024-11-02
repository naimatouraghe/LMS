using lmsapp.Server.Models;
using LMSAPP.Server.DTOs;
using LMSAPP.Server.DTOs.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LMSAPP.Server.Controllers
{
    [ApiController]
[Route("api/[controller]")]
public class CourseController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CourseController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Course
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CourseDto>>> GetCourses()
    {
        var courses = await _context.Courses
            .Include(c => c.Category)
            .Select(c => c.ToDto())
            .ToListAsync();

        return Ok(courses);
    }

    // GET: api/Course/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<CourseDto>> GetCourse(string id)
    {
        if (!Guid.TryParse(id, out Guid courseId))
        {
            return BadRequest("Invalid ID format");
        }

        var course = await _context.Courses
            .Include(c => c.Category)
            .FirstOrDefaultAsync(c => c.Id == courseId);

        if (course == null)
        {
            return NotFound();
        }

        return course.ToDto();
    }

    // POST: api/Course
    [HttpPost]
    public async Task<ActionResult<CourseDto>> CreateCourse([FromBody] CourseDto courseDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (!Guid.TryParse(courseDto.CategoryId, out Guid categoryGuid))
        {
            return BadRequest("Invalid CategoryId format");
        }

        var course = new Course
        {
            Id = Guid.NewGuid(),
            Title = courseDto.Title,
            Description = courseDto.Description,
            ImageUrl = courseDto.ImageUrl,
            Price = courseDto.Price,
            CategoryId = categoryGuid,
            UserId = courseDto.UserId,
            IsPublished = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        await _context.Entry(course)
            .Reference(c => c.Category)
            .LoadAsync();

        var resultDto = course.ToDto();

        return CreatedAtAction(
            nameof(GetCourse),
            new { id = resultDto.Id },
            resultDto
        );
    }

    // PUT: api/Course/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCourse(string id, CourseDto courseDto)
    {
        if (!Guid.TryParse(id, out Guid courseId))
        {
            return BadRequest("Invalid ID format");
        }

        if (!Guid.TryParse(courseDto.CategoryId, out Guid categoryGuid))
        {
            return BadRequest("Invalid CategoryId format");
        }

        var course = await _context.Courses.FindAsync(courseId);

        if (course == null)
        {
            return NotFound();
        }

        course.Title = courseDto.Title;
        course.Description = courseDto.Description;
        course.ImageUrl = courseDto.ImageUrl;
        course.Price = courseDto.Price;
        course.CategoryId = categoryGuid;
        course.IsPublished = courseDto.IsPublished;
        course.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!CourseExists(courseId))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/Course/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCourse(string id)
    {
        if (!Guid.TryParse(id, out Guid courseId))
        {
            return BadRequest("Invalid ID format");
        }

        var course = await _context.Courses.FindAsync(courseId);
        if (course == null)
        {
            return NotFound();
        }

        _context.Courses.Remove(course);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool CourseExists(Guid id)
    {
        return _context.Courses.Any(e => e.Id == id);
    }
}
}