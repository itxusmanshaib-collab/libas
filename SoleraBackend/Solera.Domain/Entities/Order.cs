namespace Solera.Domain.Entities;

public class Order
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public AppUser User { get; set; } = null!;
    public DateTime OrderDate { get; set; }
    public string Status { get; set; } = "Pending";
    public decimal TotalAmount { get; set; }
    public string DeliveryAddress { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string LocationAddress { get; set; } = string.Empty;

    public List<OrderItem> OrderItems { get; set; } = new();
}
