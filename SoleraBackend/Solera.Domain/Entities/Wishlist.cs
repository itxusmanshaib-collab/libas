namespace Solera.Domain.Entities;

public class Wishlist
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int ProductId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual AppUser? User { get; set; }
    public virtual Product? Product { get; set; }
}