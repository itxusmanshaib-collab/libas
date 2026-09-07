namespace Solera.API.DTOs;

// Nai category banane ke liye
public class CreateCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
}

// Category update karne ke liye
public class UpdateCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
}

// Category response — products count ke saath
public class CategoryResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;

    // Kitne products hain is category mein
    // Angular sidebar mein dikhega: "Electronics (25)"
    public int ProductCount { get; set; }
}