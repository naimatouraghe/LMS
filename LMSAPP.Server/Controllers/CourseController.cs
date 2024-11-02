using lmsapp.Server.Models;
using LMSAPP.Server.DTOs;
using LMSAPP.Server.DTOs.Extensions;
using LMSAPP.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
        [HttpGet("filter")]
        public async Task<ActionResult<IEnumerable<CourseDto>>> GetFilteredCourses(
    [FromQuery] string? category,
    [FromQuery] string? price,
    [FromQuery] string? level,
    [FromQuery] string? search,
    [FromQuery] string? sort)
        {
            var query = _context.Courses.AsQueryable();

            // Apply category filter
            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(c => c.Category.Name == category);
            }

            // Apply price filter
            if (!string.IsNullOrEmpty(price))
            {
                switch (price)
                {
                    case "<30":
                        query = query.Where(c => c.Price < 30);
                        break;
                    case "30-50":
                        query = query.Where(c => c.Price >= 30 && c.Price < 50);
                        break;
                    case "50-70":
                        query = query.Where(c => c.Price >= 50 && c.Price < 70);
                        break;
                    case "70-90":
                        query = query.Where(c => c.Price >= 70 && c.Price < 90);
                        break;
                    case ">90":
                        query = query.Where(c => c.Price >= 90);
                        break;
                }
            }



// Apply level filter
if (!string.IsNullOrEmpty(level) && !level.Equals("all", StringComparison.OrdinalIgnoreCase))
{
    if (Enum.TryParse<LanguageLevel>(level, true, out var languageLevel))
    {
        query = query.Where(c => c.Level == languageLevel);
    }
}

            // Apply search
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(c =>
                    c.Title.Contains(search) ||
                    (c.Description != null && c.Description.Contains(search))
                );
            }

            // Apply sorting
            if (!string.IsNullOrEmpty(sort))
            {
                query = sort switch
                {
                    "recent" => query.OrderByDescending(c => c.CreatedAt),
                    "oldest" => query.OrderBy(c => c.CreatedAt),
                    "price-asc" => query.OrderBy(c => c.Price),
                    "price-desc" => query.OrderByDescending(c => c.Price),
                    _ => query.OrderByDescending(c => c.CreatedAt)
                };
            }

            var courses = await query
                .Include(c => c.Category)
                .Where(c => c.IsPublished)
                .Select(c => new CourseDto
                {
                    Id = c.Id.ToString(),                    // Convert Guid to string
                    UserId = c.UserId.ToString(),            // Convert Guid to string
                    Title = c.Title,
                    Description = c.Description,
                    ImageUrl = c.ImageUrl,
                    Price = c.Price,
                    IsPublished = c.IsPublished,
                    CategoryId = c.CategoryId.ToString(),     // Convert Guid to string
                    Level = c.Level,
                    Category = new CategoryDto
                    {
                        Id = c.Category.Id.ToString(),       // Convert Guid to string
                        Name = c.Category.Name
                    },
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                })
                .ToListAsync();

            return Ok(courses);
        }

        private bool CourseExists(Guid id)
        {
            return _context.Courses.Any(e => e.Id == id);
        }
    }
}