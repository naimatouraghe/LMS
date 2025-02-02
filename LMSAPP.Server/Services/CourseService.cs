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
                    Level = (LanguageLevel)1,
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
                var course = await _context.Courses
                    .Include(c => c.Category)
                    .Include(c => c.Chapters)
                    .FirstOrDefaultAsync(c => c.Id == courseId);

                if (course == null)
                {
                    return Results.NotFound("Course not found");
                }

                // Mise à jour des propriétés simples
                course.Title = courseDto.Title;
                course.Description = courseDto.Description ?? "";
                course.ImageUrl = courseDto.ImageUrl ?? "";
                course.Price = courseDto.Price ?? 0;
                course.IsPublished = courseDto.IsPublished;
                course.CategoryId = courseDto.CategoryId;
                course.Level = courseDto.Level;
                course.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Retourner un DTO sans références circulaires
                var updatedCourseDto = new CourseDto
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
                        Courses = new List<CourseDto>() // Liste vide pour éviter la récursion
                    },
                    Level = course.Level,
                    Chapters = course.Chapters.Select(c => new ChapterDto
                    {
                        Id = c.Id,
                        Title = c.Title,
                        Description = c.Description,
                        VideoUrl = c.VideoUrl,
                        Position = c.Position,
                        IsPublished = c.IsPublished,
                        IsFree = c.IsFree,
                        CourseId = c.CourseId,
                        Course = null!, // Éviter la référence circulaire
                        MuxData = c.MuxData != null ? new MuxDataDto
                        {
                            Id = c.MuxData.Id,
                            AssetId = c.MuxData.AssetId,
                            PlaybackId = c.MuxData.PlaybackId,
                            ChapterId = c.Id,
                            Chapter = null! // Éviter la référence circulaire
                        } : null,
                        UserProgress = new List<UserProgressDto>(), // Liste vide pour éviter la récursion
                        CreatedAt = c.CreatedAt,
                        UpdatedAt = c.UpdatedAt
                    }).ToList(),
                    Attachments = new List<AttachmentDto>(), // Liste vide pour éviter la récursion
                    Purchases = new List<PurchaseDto>(), // Liste vide pour éviter la récursion
                    CreatedAt = course.CreatedAt,
                    UpdatedAt = course.UpdatedAt
                };

                return Results.Ok(updatedCourseDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating course");
                return Results.Problem("An error occurred while updating the course");
            }
        }

        public async Task<IResult> GetAllCoursesAsync(
            string? searchTerm = null,
            string? category = null,
            int? level = null,
            string? priceRange = null,
            string? sort = null)
        {
            try
            {
                IQueryable<Course> query = _context.Courses
                    .Include(c => c.Category)
                    .Include(c => c.Chapters)
                    .Include(c => c.Attachments)
                    .Include(c => c.Purchases);

                // Filtre par recherche
                if (!string.IsNullOrEmpty(searchTerm))
                {
                    searchTerm = searchTerm.ToLower();
                    query = query.Where(c =>
                        c.Title.ToLower().Contains(searchTerm) ||
                        c.Description.ToLower().Contains(searchTerm));
                }

                // Filtre par catégorie
                if (!string.IsNullOrEmpty(category))
                {
                    query = query.Where(c => c.Category.Name == category);
                }

                // Filtre par niveau
                if (level.HasValue)
                {
                    query = query.Where(c => (int)c.Level == level.Value);
                }

                // Filtre par prix
                if (!string.IsNullOrEmpty(priceRange))
                {
                    switch (priceRange)
                    {
                        case "<30":
                            query = query.Where(c => c.Price < 30);
                            break;
                        case "30-50":
                            query = query.Where(c => c.Price >= 30 && c.Price <= 50);
                            break;
                        case "50-70":
                            query = query.Where(c => c.Price > 50 && c.Price <= 70);
                            break;
                        case "70-90":
                            query = query.Where(c => c.Price > 70 && c.Price <= 90);
                            break;
                        case ">90":
                            query = query.Where(c => c.Price > 90);
                            break;
                    }
                }

                // Tri
                query = sort switch
                {
                    "recent" => query.OrderByDescending(c => c.CreatedAt),
                    "oldest" => query.OrderBy(c => c.CreatedAt),
                    "price-asc" => query.OrderBy(c => c.Price),
                    "price-desc" => query.OrderByDescending(c => c.Price),
                    _ => query.OrderByDescending(c => c.CreatedAt)
                };

                var courses = await query.ToListAsync();
                var courseDtos = courses.Select(MapCourseToDto).ToList();

                return Results.Ok(new { value = courseDtos });
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
                    Courses = new List<CourseDto>() // Éviter la récursion infinie
                },
                Level = course.Level,
                Chapters = course.Chapters.Select(c => new ChapterDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    Description = c.Description,
                    VideoUrl = c.VideoUrl,
                    Position = c.Position,
                    IsPublished = c.IsPublished,
                    IsFree = c.IsFree,
                    CourseId = c.CourseId,
                    Course = new CourseDto
                    {
                        Id = course.Id,
                        UserId = course.UserId,
                        Title = course.Title,
                        Description = course.Description,
                        ImageUrl = course.ImageUrl,
                        Price = course.Price,
                        IsPublished = course.IsPublished,
                        CategoryId = course.CategoryId,
                        Category = null!,
                        Level = course.Level,
                        Chapters = null!,
                        Attachments = null!,
                        Purchases = null!,
                        CreatedAt = course.CreatedAt,
                        UpdatedAt = course.UpdatedAt
                    },
                    MuxData = c.MuxData != null ? new MuxDataDto
                    {
                        AssetId = c.MuxData.AssetId,
                        PlaybackId = c.MuxData.PlaybackId,
                        Chapter = null!
                    } : null,
                    UserProgress = c.UserProgress?.Select(up => new UserProgressDto
                    {
                        Id = up.Id,
                        UserId = up.UserId,
                        ChapterId = up.ChapterId,
                        IsCompleted = up.IsCompleted,
                        CreatedAt = up.CreatedAt,
                        UpdatedAt = up.UpdatedAt,
                        User = null!,
                        Chapter = null!
                    }).ToList() ?? new List<UserProgressDto>(),
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                }).ToList(),
                Attachments = course.Attachments.Select(a => new AttachmentDto
                {
                    Id = a.Id,
                    Name = a.Name,
                    Url = a.Url,
                    CourseId = a.CourseId,
                    Course = null!, // Éviter la récursion infinie
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt
                }).ToList(),
                Purchases = course.Purchases.Select(p => new PurchaseDto
                {
                    Id = p.Id,
                    UserId = p.UserId,
                    User = null!, // Éviter la récursion infinie
                    CourseId = p.CourseId,
                    Course = null!, // Éviter la récursion infinie
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
                .Include(c => c.Chapters)
                .Include(c => c.Attachments)
                .Include(c => c.Purchases)
                .FirstOrDefaultAsync(c => c.Id == courseId);

            if (course == null) return null;

            return MapCourseToDto(course);
        }

        public async Task<IResult> DeleteCourseAsync(Guid courseId)
        {
            try
            {
                var course = await _context.Courses
                    .Include(c => c.Chapters)
                    .Include(c => c.Attachments)
                    .FirstOrDefaultAsync(c => c.Id == courseId);

                if (course == null)
                {
                    return Results.NotFound("Course not found");
                }

                // Supprimer les fichiers associés
                foreach (var attachment in course.Attachments)
                {
                    var filePath = Path.Combine(_environment.WebRootPath, "uploads", attachment.Name);
                    if (File.Exists(filePath))
                    {
                        File.Delete(filePath);
                    }
                }

                _context.Courses.Remove(course);
                await _context.SaveChangesAsync();

                return Results.Ok(new { message = "Course deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting course");
                return Results.Problem("An error occurred while deleting the course");
            }
        }

        public async Task<IResult> GetUserCoursesAsync(string userId)
        {
            try
            {
                var courses = await _context.Courses
                    .Include(c => c.Category)
                    .Include(c => c.Chapters)
                    .Include(c => c.Purchases)
                    .Where(c => c.UserId == userId)
                    .ToListAsync();

                var courseDtos = courses.Select(MapCourseToDto).ToList();
                return Results.Ok(new { value = courseDtos });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user courses");
                return Results.Problem("An error occurred while getting user courses");
            }
        }

        public async Task<IResult> GetCategoriesAsync()
        {
            try
            {
                var categories = await _context.Categories
                    .Include(c => c.Courses)
                    .Select(c => new CategoryDto
                    {
                        Id = c.Id,
                        Name = c.Name,
                        Courses = c.Courses.Select(course => new CourseDto
                        {
                            Id = course.Id,
                            UserId = course.UserId,
                            Title = course.Title,
                            Description = course.Description,
                            ImageUrl = course.ImageUrl,
                            Price = course.Price,
                            IsPublished = course.IsPublished,
                            CategoryId = course.CategoryId,
                            Category = null!, // Éviter la récursion infinie
                            Level = course.Level,
                            Chapters = new List<ChapterDto>(), // Éviter le chargement profond
                            Attachments = new List<AttachmentDto>(), // Éviter le chargement profond
                            Purchases = new List<PurchaseDto>(), // Éviter le chargement profond
                            CreatedAt = course.CreatedAt,
                            UpdatedAt = course.UpdatedAt
                        }).ToList()
                    })
                    .ToListAsync();

                return Results.Ok(new { value = categories });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting categories");
                return Results.Problem("An error occurred while getting categories");
            }
        }

        public async Task<IResult> CreateCategoryAsync(CategoryDto categoryDto)
        {
            try
            {
                var category = new Category
                {
                    Id = Guid.NewGuid(),
                    Name = categoryDto.Name,
                    Courses = new List<Course>() // Initialisation de la collection
                };

                _context.Categories.Add(category);
                await _context.SaveChangesAsync();

                var createdCategoryDto = new CategoryDto
                {
                    Id = category.Id,
                    Name = category.Name,
                    Courses = new List<CourseDto>() // Liste vide pour une nouvelle catégorie
                };

                return Results.Ok(new { value = createdCategoryDto });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating category");
                return Results.Problem("An error occurred while creating category");
            }
        }

        public async Task<IResult> UpdateCategoryAsync(Guid categoryId, CategoryDto categoryDto)
        {
            try
            {
                var category = await _context.Categories
                    .Include(c => c.Courses)
                    .FirstOrDefaultAsync(c => c.Id == categoryId);

                if (category == null)
                {
                    return Results.NotFound("Category not found");
                }

                category.Name = categoryDto.Name;

                await _context.SaveChangesAsync();

                var updatedCategoryDto = new CategoryDto
                {
                    Id = category.Id,
                    Name = category.Name,
                    Courses = category.Courses.Select(course => new CourseDto
                    {
                        Id = course.Id,
                        UserId = course.UserId,
                        Title = course.Title,
                        Description = course.Description,
                        ImageUrl = course.ImageUrl,
                        Price = course.Price,
                        IsPublished = course.IsPublished,
                        CategoryId = course.CategoryId,
                        Category = null!, // Éviter la récursion
                        Level = course.Level,
                        Chapters = new List<ChapterDto>(), // Éviter le chargement profond
                        Attachments = new List<AttachmentDto>(),
                        Purchases = new List<PurchaseDto>(),
                        CreatedAt = course.CreatedAt,
                        UpdatedAt = course.UpdatedAt
                    }).ToList()
                };

                return Results.Ok(new { value = updatedCategoryDto });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating category");
                return Results.Problem("An error occurred while updating category");
            }
        }

        public async Task<IResult> DeleteCategoryAsync(Guid categoryId)
        {
            try
            {
                var category = await _context.Categories.FindAsync(categoryId);
                if (category == null)
                {
                    return Results.NotFound("Category not found");
                }

                _context.Categories.Remove(category);
                await _context.SaveChangesAsync();

                return Results.Ok(new { message = "Category deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting category");
                return Results.Problem("An error occurred while deleting category");
            }
        }

        public async Task<IResult> AddChapterAsync(Guid courseId, CreateChapterDto chapterDto)
        {
            try
            {
                _logger.LogInformation("Starting AddChapterAsync for course {CourseId}", courseId);

                // Validation explicite
                if (string.IsNullOrWhiteSpace(chapterDto.Title))
                {
                    return Results.BadRequest("Title is required");
                }

                var course = await _context.Courses
                    .Include(c => c.Chapters)
                    .FirstOrDefaultAsync(c => c.Id == courseId);

                if (course == null)
                {
                    _logger.LogWarning("Course {CourseId} not found", courseId);
                    return Results.NotFound($"Course with ID {courseId} not found");
                }

                var chapter = new Chapter
                {
                    Id = Guid.NewGuid(),
                    Title = chapterDto.Title.Trim(),
                    Description = chapterDto.Description?.Trim() ?? "",
                    VideoUrl = chapterDto.VideoUrl?.Trim() ?? "",
                    Position = (course.Chapters?.Count ?? 0) + 1,
                    IsPublished = false,
                    IsFree = chapterDto.IsFree,
                    CourseId = courseId,
                    Course = course,
                    UserProgress = new List<UserProgress>(),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _logger.LogInformation("Adding new chapter {@Chapter}", chapter);

                await _context.Chapters.AddAsync(chapter);

                // Sauvegarde avec gestion d'erreur explicite
                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateException dbEx)
                {
                    _logger.LogError(dbEx, "Database error while saving chapter");
                    return Results.Problem(
                        title: "Database Error",
                        detail: "Could not save the chapter to the database",
                        statusCode: StatusCodes.Status500InternalServerError
                    );
                }

                var response = new
                {
                    id = chapter.Id,
                    title = chapter.Title,
                    description = chapter.Description,
                    position = chapter.Position,
                    isFree = chapter.IsFree,
                    courseId = chapter.CourseId
                };

                _logger.LogInformation("Chapter created successfully with ID {ChapterId}", chapter.Id);
                return Results.Ok(new { value = response });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error in AddChapterAsync");
                return Results.Problem(
                    title: "Internal Server Error",
                    detail: "An unexpected error occurred while adding the chapter",
                    statusCode: StatusCodes.Status500InternalServerError
                );
            }
        }

        public async Task<IResult> UpdateChapterAsync(Guid chapterId, ChapterDto chapterDto)
        {
            try
            {
                var chapter = await _context.Chapters.FindAsync(chapterId);
                if (chapter == null)
                {
                    return Results.NotFound("Chapter not found");
                }

                chapter.Title = chapterDto.Title;
                chapter.Description = chapterDto.Description;
                chapter.VideoUrl = chapterDto.VideoUrl;
                chapter.IsPublished = chapterDto.IsPublished;
                chapter.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Results.Ok(new { value = chapter });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating chapter");
                return Results.Problem("An error occurred while updating the chapter");
            }
        }

        public async Task<IResult> DeleteChapterAsync(Guid chapterId)
        {
            try
            {
                var chapter = await _context.Chapters.FindAsync(chapterId);
                if (chapter == null)
                {
                    return Results.NotFound("Chapter not found");
                }

                // Supprimer la vidéo associée si nécessaire
                if (!string.IsNullOrEmpty(chapter.VideoUrl))
                {
                    var videoPath = Path.Combine(_environment.WebRootPath, "uploads", chapter.VideoUrl);
                    if (File.Exists(videoPath))
                    {
                        File.Delete(videoPath);
                    }
                }

                _context.Chapters.Remove(chapter);
                await _context.SaveChangesAsync();

                return Results.Ok(new { message = "Chapter deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting chapter");
                return Results.Problem("An error occurred while deleting the chapter");
            }
        }

        public async Task<IResult> ReorderChaptersAsync(Guid courseId, List<Guid> chapterIds)
        {
            try
            {
                var course = await _context.Courses
                    .Include(c => c.Chapters)
                    .FirstOrDefaultAsync(c => c.Id == courseId);

                if (course == null)
                {
                    return Results.NotFound("Course not found");
                }

                // Vérifier que tous les chapitres appartiennent au cours
                if (!chapterIds.All(id => course.Chapters.Any(c => c.Id == id)))
                {
                    return Results.BadRequest("Invalid chapter IDs");
                }

                // Mettre à jour les positions
                for (int i = 0; i < chapterIds.Count; i++)
                {
                    var chapter = course.Chapters.First(c => c.Id == chapterIds[i]);
                    chapter.Position = i + 1;
                    chapter.UpdatedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                return Results.Ok(new { message = "Chapters reordered successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reordering chapters");
                return Results.Problem("An error occurred while reordering the chapters");
            }
        }

        public async Task<IResult> GetCourseChaptersAsync(Guid courseId)
        {
            try
            {
                var course = await _context.Courses
                    .Include(c => c.Category)
                    .FirstOrDefaultAsync(c => c.Id == courseId);

                if (course == null)
                {
                    return Results.NotFound("Course not found");
                }

                var chapters = await _context.Chapters
                    .Include(c => c.UserProgress)
                        .ThenInclude(up => up.User)
                    .Include(c => c.MuxData)
                    .Where(c => c.CourseId == courseId)
                    .OrderBy(c => c.Position)
                    .Select(c => new ChapterDto
                    {
                        Id = c.Id,
                        Title = c.Title,
                        Description = c.Description,
                        VideoUrl = c.VideoUrl,
                        Position = c.Position,
                        IsPublished = c.IsPublished,
                        IsFree = c.IsFree,
                        CourseId = c.CourseId,
                        Course = new CourseDto
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
                                Courses = new List<CourseDto>()
                            },
                            Level = course.Level,
                            Chapters = new List<ChapterDto>(),
                            Attachments = new List<AttachmentDto>(),
                            Purchases = new List<PurchaseDto>(),
                            CreatedAt = course.CreatedAt,
                            UpdatedAt = course.UpdatedAt
                        },
                        MuxData = c.MuxData != null ? new MuxDataDto
                        {
                            // Mapper les propriétés MuxData si nécessaire
                            AssetId = c.MuxData.AssetId,
                            PlaybackId = c.MuxData.PlaybackId,
                            Chapter = null!
                        } : null,
                        UserProgress = c.UserProgress.Select(up => new UserProgressDto
                        {
                            Id = up.Id,
                            UserId = up.UserId,
                            User = new UserDto
                            {
                                Id = up.User.Id,
                                FullName = up.User.FullName,
                                Email = up.User.Email!,
                                AvatarPath = up.User.AvatarPath,
                                Purchases = new List<PurchaseDto>(), // Liste vide pour éviter la récursion
                                UserProgress = new List<UserProgressDto>(), // Liste vide pour éviter la récursion
                                StripeCustomer = null // Si nécessaire, mapper les données Stripe
                            },
                            ChapterId = up.ChapterId,
                            Chapter = null!, // Éviter la récursion
                            IsCompleted = up.IsCompleted,
                            CreatedAt = up.CreatedAt,
                            UpdatedAt = up.UpdatedAt
                        }).ToList(),
                        CreatedAt = c.CreatedAt,
                        UpdatedAt = c.UpdatedAt
                    })
                    .ToListAsync();

                return Results.Ok(new { value = chapters });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting course chapters");
                return Results.Problem("An error occurred while getting the course chapters");
            }
        }

        public async Task<IResult> AddAttachmentAsync(Guid courseId, IFormFile file)
        {
            try
            {
                var course = await _context.Courses
                    .Include(c => c.Category)
                    .FirstOrDefaultAsync(c => c.Id == courseId);

                if (course == null)
                {
                    return Results.NotFound("Course not found");
                }

                // Vérifier le type de fichier
                var allowedTypes = new[] { ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".zip" };
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!allowedTypes.Contains(extension))
                {
                    return Results.BadRequest("Invalid file type");
                }

                // Créer le dossier uploads s'il n'existe pas
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "attachments");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                // Générer un nom de fichier unique
                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                // Sauvegarder le fichier
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Créer l'attachement dans la base de données
                var attachment = new Attachment
                {
                    Id = Guid.NewGuid(),
                    Name = file.FileName,
                    Url = $"/uploads/attachments/{fileName}",
                    CourseId = courseId,
                    Course = course,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Attachments.Add(attachment);
                await _context.SaveChangesAsync();

                var attachmentDto = new AttachmentDto
                {
                    Id = attachment.Id,
                    Name = attachment.Name,
                    Url = attachment.Url,
                    CourseId = attachment.CourseId,
                    Course = new CourseDto
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
                            Courses = new List<CourseDto>()
                        },
                        Level = course.Level,
                        Chapters = new List<ChapterDto>(),
                        Attachments = new List<AttachmentDto>(),
                        Purchases = new List<PurchaseDto>(),
                        CreatedAt = course.CreatedAt,
                        UpdatedAt = course.UpdatedAt
                    },
                    CreatedAt = attachment.CreatedAt,
                    UpdatedAt = attachment.UpdatedAt
                };

                return Results.Ok(new { value = attachmentDto });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding attachment");
                return Results.Problem("An error occurred while adding the attachment");
            }
        }

        public async Task<IResult> DeleteAttachmentAsync(Guid attachmentId)
        {
            try
            {
                var attachment = await _context.Attachments.FindAsync(attachmentId);
                if (attachment == null)
                {
                    return Results.NotFound("Attachment not found");
                }

                // Supprimer le fichier physique
                var filePath = Path.Combine(_environment.WebRootPath, "uploads", attachment.Name);
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }

                _context.Attachments.Remove(attachment);
                await _context.SaveChangesAsync();

                return Results.Ok(new { message = "Attachment deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting attachment");
                return Results.Problem("An error occurred while deleting the attachment");
            }
        }

        public async Task<IResult> GetCourseAttachmentsAsync(Guid courseId)
        {
            try
            {
                var course = await _context.Courses
                    .Include(c => c.Category)
                    .FirstOrDefaultAsync(c => c.Id == courseId);

                if (course == null)
                {
                    return Results.NotFound("Course not found");
                }

                var attachments = await _context.Attachments
                    .Where(a => a.CourseId == courseId)
                    .Select(a => new AttachmentDto
                    {
                        Id = a.Id,
                        Name = a.Name,
                        Url = a.Url,
                        CourseId = a.CourseId,
                        Course = new CourseDto
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
                                Courses = new List<CourseDto>()
                            },
                            Level = course.Level,
                            Chapters = new List<ChapterDto>(),
                            Attachments = new List<AttachmentDto>(),
                            Purchases = new List<PurchaseDto>(),
                            CreatedAt = course.CreatedAt,
                            UpdatedAt = course.UpdatedAt
                        },
                        CreatedAt = a.CreatedAt,
                        UpdatedAt = a.UpdatedAt
                    })
                    .ToListAsync();

                return Results.Ok(new { value = attachments });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting course attachments");
                return Results.Problem("An error occurred while getting the course attachments");
            }
        }

        public async Task<IResult> GetTeacherAnalyticsAsync(string userId)
        {
            try
            {
                var courses = await _context.Courses
                    .Where(c => c.UserId == userId)
                    .Include(c => c.Category)
                    .Include(c => c.Purchases)
                        .ThenInclude(p => p.User)
                    .ToListAsync();

                var purchases = courses.SelectMany(c => c.Purchases.Select(p => new PurchaseDto
                {
                    Id = p.Id,
                    UserId = p.UserId,
                    User = new UserDto
                    {
                        Id = p.User.Id,
                        FullName = p.User.FullName,
                        Email = p.User.Email,
                        AvatarPath = p.User.AvatarPath,
                        Purchases = new List<PurchaseDto>(),
                        UserProgress = new List<UserProgressDto>(),
                        StripeCustomer = null
                    },
                    CourseId = p.CourseId,
                    Course = new CourseDto
                    {
                        Id = c.Id,
                        UserId = c.UserId,
                        Title = c.Title,
                        Description = c.Description,
                        ImageUrl = c.ImageUrl,
                        Price = c.Price,
                        IsPublished = c.IsPublished,
                        CategoryId = c.CategoryId,
                        Category = new CategoryDto
                        {
                            Id = c.Category.Id,
                            Name = c.Category.Name,
                            Courses = new List<CourseDto>()
                        },
                        Level = c.Level,
                        Chapters = new List<ChapterDto>(),
                        Attachments = new List<AttachmentDto>(),
                        Purchases = new List<PurchaseDto>(),
                        CreatedAt = c.CreatedAt,
                        UpdatedAt = c.UpdatedAt
                    },
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt
                })).ToList();

                var analytics = new
                {
                    totalCourses = courses.Count,
                    totalPurchases = purchases.Count,
                    totalRevenue = courses.Sum(c => c.Price * c.Purchases.Count),
                    purchases = purchases
                };

                return Results.Ok(new { value = analytics });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting teacher analytics");
                return Results.Problem("An error occurred while getting teacher analytics");
            }
        }

        public async Task<IResult> GetPurchasedCoursesAsync(string userId)
        {
            try
            {
                _logger.LogInformation("Getting purchased courses for user {UserId}", userId);

                // Vérifier si l'utilisateur existe
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    _logger.LogWarning("User {UserId} not found", userId);
                    return Results.NotFound("User not found");
                }

                // Vérifier les achats existants
                var purchases = await _context.Purchases
                    .Where(p => p.UserId == userId)
                    .ToListAsync();

                _logger.LogInformation("Found {Count} purchases for user {UserId}",
                    purchases.Count, userId);

                if (!purchases.Any())
                {
                    _logger.LogInformation("No purchases found for user {UserId}", userId);
                    return Results.Ok(new { value = new List<object>() });
                }

                // Récupérer les chapitres complétés
                var completedChapters = await _context.UserProgresses
                    .Where(up => up.UserId == userId && up.IsCompleted)
                    .Select(up => up.ChapterId)
                    .ToListAsync();

                _logger.LogInformation("Found {Count} completed chapters for user {UserId}",
                    completedChapters.Count, userId);

                // Récupérer les cours avec leurs détails
                var purchasedCourses = await _context.Purchases
                    .Where(p => p.UserId == userId)
                    .Include(p => p.Course)
                        .ThenInclude(c => c.Category)
                    .Include(p => p.Course.Chapters)
                    .Select(p => new
                    {
                        Id = p.Course.Id,
                        Title = p.Course.Title,
                        Description = p.Course.Description,
                        ImageUrl = p.Course.ImageUrl,
                        Price = p.Course.Price,
                        IsPublished = p.Course.IsPublished,
                        CategoryId = p.Course.CategoryId,
                        Level = p.Course.Level,
                        Category = new
                        {
                            Id = p.Course.Category.Id,
                            Name = p.Course.Category.Name
                        },
                        Progress = p.Course.Chapters.Any()
                            ? Math.Round((double)p.Course.Chapters
                                .Count(c => completedChapters.Contains(c.Id))
                                / p.Course.Chapters.Count * 100)
                            : 0
                    })
                    .ToListAsync();

                _logger.LogInformation("Returning {Count} purchased courses for user {UserId}",
                    purchasedCourses.Count, userId);

                return Results.Ok(new { value = purchasedCourses });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting purchased courses for user {UserId}", userId);
                return Results.Problem("An error occurred while getting purchased courses");
            }
        }

        public async Task<bool> HasUserPurchasedCourseAsync(string userId, Guid courseId)
        {
            try
            {
                return await _context.Purchases
                    .AnyAsync(p => p.UserId == userId && p.CourseId == courseId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking course purchase");
                return false;
            }
        }

        public async Task<IResult> GetCourseProgressAsync(string userId, Guid courseId)
        {
            try
            {
                var hasPurchased = await HasUserPurchasedCourseAsync(userId, courseId);
                if (!hasPurchased)
                {
                    return Results.BadRequest("User has not purchased this course");
                }

                var course = await _context.Courses
                    .Include(c => c.Category)
                    .Include(c => c.Chapters)
                        .ThenInclude(ch => ch.UserProgress.Where(up => up.UserId == userId))
                            .ThenInclude(up => up.User)
                    .FirstOrDefaultAsync(c => c.Id == courseId);

                if (course == null)
                {
                    return Results.NotFound("Course not found");
                }

                var userProgress = course.Chapters
                    .SelectMany(ch => ch.UserProgress)
                    .Where(up => up.UserId == userId)
                    .Select(up => new UserProgressDto
                    {
                        Id = up.Id,
                        UserId = up.UserId,
                        User = new UserDto
                        {
                            Id = up.User.Id,
                            FullName = up.User.FullName,
                            Email = up.User.Email,
                            AvatarPath = up.User.AvatarPath,
                            Purchases = new List<PurchaseDto>(),
                            UserProgress = new List<UserProgressDto>(),
                            StripeCustomer = null
                        },
                        ChapterId = up.ChapterId,
                        Chapter = new ChapterDto
                        {
                            Id = up.Chapter.Id,
                            Title = up.Chapter.Title,
                            Description = up.Chapter.Description,
                            VideoUrl = up.Chapter.VideoUrl,
                            Position = up.Chapter.Position,
                            IsPublished = up.Chapter.IsPublished,
                            IsFree = up.Chapter.IsFree,
                            CourseId = up.Chapter.CourseId,
                            Course = new CourseDto
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
                                    Courses = new List<CourseDto>()
                                },
                                Level = course.Level,
                                Chapters = new List<ChapterDto>(),
                                Attachments = new List<AttachmentDto>(),
                                Purchases = new List<PurchaseDto>(),
                                CreatedAt = course.CreatedAt,
                                UpdatedAt = course.UpdatedAt
                            },
                            MuxData = null,
                            UserProgress = new List<UserProgressDto>(),
                            CreatedAt = up.Chapter.CreatedAt,
                            UpdatedAt = up.Chapter.UpdatedAt
                        },
                        IsCompleted = up.IsCompleted,
                        CreatedAt = up.CreatedAt,
                        UpdatedAt = up.UpdatedAt
                    })
                    .ToList();

                return Results.Ok(new { value = userProgress });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting course progress");
                return Results.Problem("An error occurred while getting course progress");
            }
        }

        public async Task<IResult> CreateInitialCourseAsync(InitialCourseDto initialCourseDto, string userId)
        {
            try
            {
                var teacher = await _context.Users.FindAsync(userId);
                if (teacher == null)
                {
                    return Results.BadRequest("Teacher not found");
                }

                // Obtenir ou créer une catégorie par défaut
                var defaultCategory = await _context.Categories.FirstOrDefaultAsync()
                    ?? _context.Categories.Add(new Category { Id = Guid.NewGuid(), Name = "Uncategorized" }).Entity;

                var course = new Course
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Teacher = teacher,
                    Title = initialCourseDto.Title,
                    Description = "",
                    ImageUrl = "",
                    Price = 0,
                    IsPublished = false,
                    CategoryId = defaultCategory.Id,
                    Category = defaultCategory,
                    Level = (LanguageLevel)1,
                    Chapters = new List<Chapter>(),
                    Attachments = new List<Attachment>(),
                    Purchases = new List<Purchase>(),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Courses.Add(course);
                await _context.SaveChangesAsync();

                return Results.Ok(new { id = course.Id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating initial course");
                return Results.Problem("An error occurred while creating the initial course");
            }
        }
    }
}