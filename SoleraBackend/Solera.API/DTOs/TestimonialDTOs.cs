namespace Solera.API.DTOs;

public class CreateTestimonialDto
{
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerRole { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int Rating { get; set; } = 5;
    public string ImageUrl { get; set; } = string.Empty;
    public int DisplayOrder { get; set; } = 1;
}

public class UpdateTestimonialDto
{
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerRole { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int Rating { get; set; } = 5;
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; } = 1;
}
