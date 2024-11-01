using lmsapp.Server.Models;
using LMSAPP.Server.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Attachment = lmsapp.Server.Models.Attachment;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<Course> Courses { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Attachment> Attachments { get; set; }
    public DbSet<Chapter> Chapters { get; set; }
    public DbSet<MuxData> MuxDatas { get; set; }
    public DbSet<UserProgress> UserProgresses { get; set; }
    public DbSet<Purchase> Purchases { get; set; }
    public DbSet<StripeCustomer> StripeCustomers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Course-Category one-to-many relationship
        modelBuilder.Entity<Course>()
            .HasOne(c => c.Category)
            .WithMany(ca => ca.Courses)
            .HasForeignKey(c => c.CategoryId);

        // Course-Attachment one-to-many relationship
        modelBuilder.Entity<Attachment>()
            .HasOne(a => a.Course)
            .WithMany(c => c.Attachments)
            .HasForeignKey(a => a.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        // Course-Chapter one-to-many relationship
        modelBuilder.Entity<Chapter>()
            .HasOne(ch => ch.Course)
            .WithMany(c => c.Chapters)
            .HasForeignKey(ch => ch.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        // Chapter-MuxData one-to-one relationship
        modelBuilder.Entity<MuxData>()
            .HasOne(m => m.Chapter)
            .WithOne(ch => ch.MuxData)
            .HasForeignKey<MuxData>(m => m.ChapterId)
            .OnDelete(DeleteBehavior.Cascade);

        // Chapter-UserProgress one-to-many relationship
        modelBuilder.Entity<UserProgress>()
            .HasOne(up => up.Chapter)
            .WithMany(ch => ch.UserProgress)
            .HasForeignKey(up => up.ChapterId)
            .OnDelete(DeleteBehavior.Cascade);

        // Course-Purchase one-to-many relationship
        modelBuilder.Entity<Purchase>()
            .HasOne(p => p.Course)
            .WithMany(c => c.Purchases)
            .HasForeignKey(p => p.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        // Additional indexes and unique constraints
        modelBuilder.Entity<Category>()
            .HasIndex(c => c.Name)
            .IsUnique();

        modelBuilder.Entity<MuxData>()
            .HasIndex(m => m.ChapterId)
            .IsUnique();

        modelBuilder.Entity<UserProgress>()
            .HasIndex(up => new { up.UserId, up.ChapterId })
            .IsUnique();

        modelBuilder.Entity<StripeCustomer>()
            .HasIndex(sc => sc.UserId)
            .IsUnique();
    }
}
