using lmsapp.Server.Models;

namespace LMSAPP.Server.DTOs.Extensions
{
    public static class MappingExtensions
    {
         public static CourseDto ToDto(this Course course)
        {
            return new CourseDto
            {
                Id = course.Id.ToString(),
                Title = course.Title,
                Description = course.Description,
                ImageUrl = course.ImageUrl,
                Price = course.Price,
                IsPublished = course.IsPublished,
                CategoryId = course.CategoryId.ToString(),
                Category = course.Category?.ToDto(),
                UserId = course.UserId,
                Level = course.Level,  // Ajoutez cette ligne
                CreatedAt = course.CreatedAt,
                UpdatedAt = course.UpdatedAt
            };
        }

        // Ajoutez également la conversion dans l'autre sens
        public static Course ToEntity(this CourseDto dto)
        {
            return new Course
            {
                Id = string.IsNullOrEmpty(dto.Id) ? Guid.NewGuid() : Guid.Parse(dto.Id),
                Title = dto.Title,
                Description = dto.Description,
                ImageUrl = dto.ImageUrl,
                Price = dto.Price,
                IsPublished = dto.IsPublished,
                CategoryId = Guid.Parse(dto.CategoryId),
                UserId = dto.UserId,
                Level = dto.Level,  // Ajoutez cette ligne
                CreatedAt = dto.CreatedAt,
                UpdatedAt = dto.UpdatedAt
            };
        }

         public static CategoryDto ToDto(this Category category)
    {
        return new CategoryDto
        {
            Id = category.Id.ToString(), // Conversion explicite du Guid en string
            Name = category.Name
        };
    }

    // Si vous avez aussi une méthode pour convertir du DTO vers l'entité
    public static Category ToEntity(this CategoryDto dto)
    {
        return new Category
        {
            Id = string.IsNullOrEmpty(dto.Id) ? Guid.NewGuid() : Guid.Parse(dto.Id),
            Name = dto.Name
        };
    }

       public static ChapterDto ToDto(this Chapter chapter)
    {
        return new ChapterDto
        {
            Id = chapter.Id.ToString(),
            Title = chapter.Title,
            Description = chapter.Description,
            VideoUrl = chapter.VideoUrl,
            Position = chapter.Position,
            IsPublished = chapter.IsPublished,
            CourseId = chapter.CourseId.ToString(),
            CreatedAt = chapter.CreatedAt,
            UpdatedAt = chapter.UpdatedAt
        };
    }

    public static Chapter ToEntity(this ChapterDto dto)
    {
        return new Chapter
        {
            Id = string.IsNullOrEmpty(dto.Id) ? Guid.NewGuid() : Guid.Parse(dto.Id),
            Title = dto.Title,
            Description = dto.Description,
            VideoUrl = dto.VideoUrl,
            Position = dto.Position,
            IsPublished = dto.IsPublished,
            CourseId = Guid.Parse(dto.CourseId),
            CreatedAt = dto.CreatedAt,
            UpdatedAt = dto.UpdatedAt
        };
    }

        public static AttachmentDto ToDto(this Attachment attachment)
    {
        return new AttachmentDto
        {
            Id = attachment.Id.ToString(),
            Name = attachment.Name,
            Url = attachment.Url,
            CourseId = attachment.CourseId.ToString()
        };
    }

    public static Attachment ToEntity(this AttachmentDto dto)
    {
        return new Attachment
        {
            Id = string.IsNullOrEmpty(dto.Id) ? Guid.NewGuid() : Guid.Parse(dto.Id),
            Name = dto.Name,
            Url = dto.Url,
            CourseId = Guid.Parse(dto.CourseId)
        };
    }

    public static MuxDataDto ToDto(this MuxData muxData)
    {
        return new MuxDataDto
        {
            Id = muxData.Id.ToString(),
            AssetId = muxData.AssetId,
            PlaybackId = muxData.PlaybackId,
            ChapterId = muxData.ChapterId.ToString()
        };
    }

    public static MuxData ToEntity(this MuxDataDto dto)
    {
        return new MuxData
        {
            Id = string.IsNullOrEmpty(dto.Id) ? Guid.NewGuid() : Guid.Parse(dto.Id),
            AssetId = dto.AssetId,
            PlaybackId = dto.PlaybackId,
            ChapterId = Guid.Parse(dto.ChapterId)
        };
    }

public static UserProgressDto ToDto(this UserProgress progress)
    {
        return new UserProgressDto
        {
            Id = progress.Id.ToString(),
            UserId = progress.UserId,
            ChapterId = progress.ChapterId.ToString(),
            IsCompleted = progress.IsCompleted,
            CreatedAt = progress.CreatedAt,
            UpdatedAt = progress.UpdatedAt
        };
    }

    public static UserProgress ToEntity(this UserProgressDto dto)
    {
        return new UserProgress
        {
            Id = string.IsNullOrEmpty(dto.Id) ? Guid.NewGuid() : Guid.Parse(dto.Id),
            UserId = dto.UserId,
            ChapterId = Guid.Parse(dto.ChapterId),
            IsCompleted = dto.IsCompleted,
            CreatedAt = dto.CreatedAt,
            UpdatedAt = dto.UpdatedAt
        };
    }

 public static PurchaseDto ToDto(this Purchase purchase)
    {
        return new PurchaseDto
        {
            Id = purchase.Id.ToString(),
            UserId = purchase.UserId,
            CourseId = purchase.CourseId.ToString(),
            
            CreatedAt = purchase.CreatedAt,
            UpdatedAt = purchase.UpdatedAt,
            Course = purchase.Course?.ToDto()
        };
    }

    public static Purchase ToEntity(this PurchaseDto dto)
    {
        return new Purchase
        {
            Id = string.IsNullOrEmpty(dto.Id) ? Guid.NewGuid() : Guid.Parse(dto.Id),
            UserId = dto.UserId,
            CourseId = Guid.Parse(dto.CourseId),
     
            CreatedAt = dto.CreatedAt,
            UpdatedAt = dto.UpdatedAt
        };
    }

    }
}