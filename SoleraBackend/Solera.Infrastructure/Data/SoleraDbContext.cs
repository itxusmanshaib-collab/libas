using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Solera.Domain.Entities;

namespace Solera.Infrastructure.Data
{
    public partial class SoleraDbContext : DbContext
    {
        public SoleraDbContext(DbContextOptions<SoleraDbContext> options)
            : base(options)
        {
        }

        public DbSet<ContactUs> ContactUs { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<AppUser> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<SiteSettings> SiteSettings { get; set; }
        public DbSet<WhyChooseUs> WhyChooseUs { get; set; }
        public DbSet<Testimonial> Testimonials { get; set; }
        public DbSet<Banner> Banners { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Wishlist> Wishlists { get; set; }
        public DbSet<Review> Reviews { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ContactUs>(entity =>
            {
                entity.HasKey(e => e.Id);
            });

            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.Id);
            });

            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasKey(e => e.Id);
            });

            modelBuilder.Entity<AppUser>(entity =>
            {
                entity.HasKey(e => e.Id);
            });

            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.Id);
            });

            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasKey(e => e.Id);
            });

            modelBuilder.Entity<SiteSettings>(entity =>
            {
                entity.HasKey(e => e.Id);
            });

            modelBuilder.Entity<WhyChooseUs>(entity =>
            {
                entity.HasKey(e => e.Id);
            });

            modelBuilder.Entity<Testimonial>(entity =>
            {
                entity.HasKey(e => e.Id);
            });

            modelBuilder.Entity<Banner>(entity =>
            {
                entity.HasKey(e => e.Id);
            });

            modelBuilder.Entity<Cart>(entity =>
            {
                entity.HasKey(e => e.Id);
            });

            modelBuilder.Entity<CartItem>(entity =>
            {
                entity.HasKey(e => e.Id);
            });

            modelBuilder.Entity<Wishlist>(entity =>
            {
                entity.HasKey(e => e.Id);
            });

            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasKey(e => e.Id);
            });
        }
    }
}