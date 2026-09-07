namespace Solera.API.DTOs;

public class CreateProductDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string GalleryImages { get; set; } = "[]";
    public string AvailableColors { get; set; } = "[]";
    public string AvailableSizes { get; set; } = "[]";
    public int CategoryId { get; set; }
    public decimal? DiscountPercentage { get; set; }
    public decimal? DiscountAmount { get; set; }
}

public class UpdateProductDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string GalleryImages { get; set; } = "[]";
    public string AvailableColors { get; set; } = "[]";
    public string AvailableSizes { get; set; } = "[]";
    public bool IsActive { get; set; }
    public int CategoryId { get; set; }
    public decimal? DiscountPercentage { get; set; }
    public decimal? DiscountAmount { get; set; }
}

public class UpdateStatusDto
{
    public string Status { get; set; } = string.Empty;
}
