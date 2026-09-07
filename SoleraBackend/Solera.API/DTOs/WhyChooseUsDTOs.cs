namespace Solera.API.DTOs;

public class CreateWhyChooseUsDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public int DisplayOrder { get; set; } = 1;
}

public class UpdateWhyChooseUsDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public int DisplayOrder { get; set; } = 1;
    public bool IsActive { get; set; } = true;
}