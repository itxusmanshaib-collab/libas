namespace Solera.API.DTOs;

public class CreateBannerDto
{
    public string Title { get; set; } = string.Empty;
    public string SubTitle { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string LinkUrl { get; set; } = string.Empty;
    public string ButtonText { get; set; } = string.Empty;
    public int DisplayOrder { get; set; } = 1;
    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public DateTime EndDate { get; set; } = DateTime.UtcNow.AddDays(30);
}

public class CreateReviewDto
{
    public int ProductId { get; set; }

    // 1 se 5 ke beech hona chahiye
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
}

public class CreateNotificationDto
{
    public string Message { get; set; } = string.Empty;
    public string BackgroundColor { get; set; } = "#C0392B";
    public string TextColor { get; set; } = "#FFFFFF";
    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public DateTime EndDate { get; set; } = DateTime.UtcNow.AddDays(7);
}