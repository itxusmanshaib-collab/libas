namespace Solera.API.DTOs;

public class AddToCartDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; } = 1;
    public string SelectedColor { get; set; } = string.Empty;
    public string SelectedSize { get; set; } = string.Empty;
}

public class UpdateCartItemDto
{
    public int Quantity { get; set; }
}

public class CartItemResponseDto
{
    public int CartItemId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductImage { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public decimal OriginalPrice { get; set; }
    public bool HasDiscount { get; set; }
    public int Quantity { get; set; }
    public decimal SubTotal { get; set; }
    public int AvailableStock { get; set; }
    public string SelectedColor { get; set; } = string.Empty;
    public string SelectedSize { get; set; } = string.Empty;
}

public class CartResponseDto
{
    public int CartId { get; set; }
    public List<CartItemResponseDto> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public decimal TotalAmount { get; set; }
}
