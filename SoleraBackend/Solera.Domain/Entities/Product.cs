using System.ComponentModel.DataAnnotations.Schema;

namespace Solera.Domain.Entities;

public class Product
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public int Stock { get; set; }

    public string ImageUrl { get; set; } = string.Empty;
    public string GalleryImages { get; set; } = "[]";
    public string AvailableColors { get; set; } = "[]";
    public string AvailableSizes { get; set; } = "[]";

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; }

    public int CategoryId { get; set; }

    public decimal? DiscountPercentage { get; set; }
    public decimal? DiscountAmount { get; set; }

    public Category Category { get; set; } = null!;

    [NotMapped]
    public bool HasDiscount => (DiscountPercentage.HasValue && DiscountPercentage > 0) ||
                               (DiscountAmount.HasValue && DiscountAmount > 0);

    [NotMapped]
    public decimal FinalPrice
    {
        get
        {
            if (DiscountPercentage.HasValue && DiscountPercentage > 0)
                return Price - (Price * DiscountPercentage.Value / 100);
            if (DiscountAmount.HasValue && DiscountAmount > 0)
                return Price - DiscountAmount.Value;
            return Price;
        }
    }
}
