namespace Solera.Domain.Entities;

public class Banner
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string SubTitle { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string LinkUrl { get; set; } = string.Empty;
    public string ButtonText { get; set; } = string.Empty;
    public int DisplayOrder { get; set; } = 1;
    public bool IsActive { get; set; } = true;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime CreatedAt { get; set; }
}
