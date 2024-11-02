using lmsapp.Server.Models;
using LMSAPP.Server.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMSAPP.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoriesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Categories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
        {
            var categories = await _context.Categories
                .OrderBy(c => c.Name)
                .Select(c => new CategoryDto
                {
                    Id = c.Id.ToString(),
                    Name = c.Name
                })
                .ToListAsync();

            return Ok(categories);
        }

        // GET: api/Categories/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDto>> GetCategory(string id)
        {
            if (!Guid.TryParse(id, out Guid guidId))
            {
                return BadRequest("Invalid ID format");
            }

            var category = await _context.Categories
                .Where(c => c.Id == guidId)
                .Select(c => new CategoryDto
                {
                    Id = c.Id.ToString(),
                    Name = c.Name
                })
                .FirstOrDefaultAsync();

            if (category == null)
            {
                return NotFound();
            }

            return category;
        }

        // POST: api/Categories
        [HttpPost]
        [HttpPost]
        public async Task<ActionResult<CategoryDto>> CreateCategory(CategoryDto categoryDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = categoryDto.Name
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            var createdCategoryDto = new CategoryDto
            {
                Id = category.Id.ToString(),  // Conversion explicite du Guid en string
                Name = category.Name
            };

            return CreatedAtAction(
                nameof(GetCategory),
                new { id = category.Id.ToString() },  // Conversion explicite du Guid en string
                createdCategoryDto
            );
        }

        // PUT: api/Categories/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(string id, CategoryDto categoryDto)
        {
            if (id != categoryDto.Id)
            {
                return BadRequest();
            }

            if (!Guid.TryParse(id, out Guid guidId))
            {
                return BadRequest("Invalid ID format");
            }

            var category = await _context.Categories.FindAsync(guidId);
            if (category == null)
            {
                return NotFound();
            }

            category.Name = categoryDto.Name;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CategoryExists(guidId))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Categories/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(string id)
        {
            if (!Guid.TryParse(id, out Guid guidId))
            {
                return BadRequest("Invalid ID format");
            }

            var category = await _context.Categories.FindAsync(guidId);
            if (category == null)
            {
                return NotFound();
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CategoryExists(Guid id)
        {
            return _context.Categories.Any(e => e.Id == id);
        }
    }
}