namespace Solera.Domain.Entities;

public class Notification
{
    public int Id { get; set; }
    public string Message { get; set; } = string.Empty;
    public string BackgroundColor { get; set; } = "#C0392B";
    public string TextColor { get; set; } = "#FFFFFF";
    public bool IsActive { get; set; } = true;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime CreatedAt { get; set; }
}
