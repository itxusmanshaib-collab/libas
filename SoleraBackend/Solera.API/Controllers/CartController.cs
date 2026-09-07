using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Solera.API.DTOs;
using Solera.API.Helpers;
using Solera.Domain.Entities;
using Solera.Infrastructure.Data;
using System.Security.Claims;

namespace Solera.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly SoleraDbContext _context;

    public CartController(SoleraDbContext context)
    {
        _context = context;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst("sub")?.Value
                       ?? User.FindFirst("userId")?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            throw new UnauthorizedAccessException("Invalid or missing user identity.");
        return userId;
    }

    private async Task<Cart> GetOrCreateCartAsync(int userId)
    {
        var cart = await _context.Carts
            .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Product)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
        {
            cart = new Cart
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
        }

        return cart;
    }

    private CartResponseDto MapToCartResponse(Cart cart)
    {
        var items = cart.CartItems.Select(ci => new CartItemResponseDto
        {
            CartItemId = ci.Id,
            ProductId = ci.ProductId,
            ProductName = ci.Product?.Name ?? "",
            ProductImage = ci.Product?.ImageUrl ?? "",
            UnitPrice = ci.Product?.FinalPrice ?? ci.Product?.Price ?? 0,
            OriginalPrice = ci.Product?.Price ?? 0,
            HasDiscount = ci.Product?.HasDiscount ?? false,
            Quantity = ci.Quantity,
            SubTotal = (ci.Product?.FinalPrice ?? ci.Product?.Price ?? 0) * ci.Quantity,
            AvailableStock = ci.Product?.Stock ?? 0
            ,SelectedColor = ci.SelectedColor
            ,SelectedSize = ci.SelectedSize
        }).ToList();

        return new CartResponseDto
        {
            CartId = cart.Id,
            Items = items,
            TotalItems = items.Sum(i => i.Quantity),
            TotalAmount = items.Sum(i => i.SubTotal)
        };
    }

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var userId = GetCurrentUserId();
        var cart = await GetOrCreateCartAsync(userId);

        cart = await _context.Carts
            .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Product)
            .FirstAsync(c => c.Id == cart.Id);

        return Ok(ApiResponse<CartResponseDto>.SuccessResponse(
            MapToCartResponse(cart),
            "Cart retrieved successfully"
        ));
    }

    [HttpPost("add")]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
    {
        if (dto.Quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero.");

        var userId = GetCurrentUserId();

        var product = await _context.Products.FindAsync(dto.ProductId);
        if (product == null)
            throw new KeyNotFoundException("Product not found.");

        if (!product.IsActive)
            throw new ArgumentException("This product is currently unavailable.");

        if (product.Stock < dto.Quantity)
            return BadRequest(ApiResponse<object>.ErrorResponse(
                $"Only {product.Stock} pieces available", 400));

        var cart = await GetOrCreateCartAsync(userId);

        var existingItem = await _context.CartItems
            .FirstOrDefaultAsync(ci =>
                ci.CartId == cart.Id &&
                ci.ProductId == dto.ProductId &&
                ci.SelectedColor == dto.SelectedColor &&
                ci.SelectedSize == dto.SelectedSize);

        if (existingItem != null)
        {
            var newQuantity = existingItem.Quantity + dto.Quantity;

            if (newQuantity > product.Stock)
                return BadRequest(ApiResponse<object>.ErrorResponse(
                    $"Only {product.Stock} pieces available. Cart already has {existingItem.Quantity}.", 400));

            existingItem.Quantity = newQuantity;
        }
        else
        {
            var cartItem = new CartItem
            {
                CartId = cart.Id,
                ProductId = dto.ProductId,
                Quantity = dto.Quantity,
                SelectedColor = dto.SelectedColor.Trim(),
                SelectedSize = dto.SelectedSize.Trim(),
                AddedAt = DateTime.UtcNow
            };
            _context.CartItems.Add(cartItem);
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        cart = await _context.Carts
            .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Product)
            .FirstAsync(c => c.Id == cart.Id);

        return Ok(ApiResponse<CartResponseDto>.SuccessResponse(
            MapToCartResponse(cart),
            "Product added to cart successfully."
        ));
    }

    [HttpPut("items/{cartItemId}")]
    public async Task<IActionResult> UpdateQuantity(
        int cartItemId, [FromBody] UpdateCartItemDto dto)
    {
        if (dto.Quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero.");

        var userId = GetCurrentUserId();

        var cartItem = await _context.CartItems
            .Include(ci => ci.Cart)
            .Include(ci => ci.Product)
            .FirstOrDefaultAsync(ci => ci.Id == cartItemId);

        if (cartItem == null)
            throw new KeyNotFoundException("Cart item not found.");

        if (cartItem.Cart.UserId != userId)
            return Forbid();

        if (dto.Quantity > cartItem.Product.Stock)
            throw new ArgumentException(
                $"Only {cartItem.Product.Stock} item(s) are available.");

        cartItem.Quantity = dto.Quantity;
        cartItem.Cart.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var cart = await _context.Carts
            .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Product)
            .FirstAsync(c => c.Id == cartItem.CartId);

        return Ok(ApiResponse<CartResponseDto>.SuccessResponse(
            MapToCartResponse(cart),
            "Cart updated successfully."
        ));
    }

    [HttpDelete("items/{cartItemId}")]
    public async Task<IActionResult> RemoveItem(int cartItemId)
    {
        var userId = GetCurrentUserId();

        var cartItem = await _context.CartItems
            .Include(ci => ci.Cart)
            .FirstOrDefaultAsync(ci => ci.Id == cartItemId);

        if (cartItem == null)
            throw new KeyNotFoundException("Cart item not found.");

        if (cartItem.Cart.UserId != userId)
            return Forbid();

        _context.CartItems.Remove(cartItem);
        cartItem.Cart.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var cart = await _context.Carts
            .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Product)
            .FirstAsync(c => c.Id == cartItem.CartId);

        return Ok(ApiResponse<CartResponseDto>.SuccessResponse(
            MapToCartResponse(cart),
            "Item removed from cart successfully."
        ));
    }

    [HttpDelete("clear")]
    public async Task<IActionResult> ClearCart()
    {
        var userId = GetCurrentUserId();

        var cart = await _context.Carts
            .Include(c => c.CartItems)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null || !cart.CartItems.Any())
            return Ok(ApiResponse<object>.SuccessResponse(
                null,
                "Cart is already empty."
            ));

        _context.CartItems.RemoveRange(cart.CartItems);
        cart.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.SuccessResponse(
            null,
            "Cart cleared successfully."
        ));
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout(
        [FromBody] CartCheckoutDto dto)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(dto.DeliveryAddress))
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "Delivery address is required", 400));

        if (string.IsNullOrWhiteSpace(dto.PhoneNumber))
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "Phone number is required", 400));

        var cart = await _context.Carts
            .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Product)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null || !cart.CartItems.Any())
            throw new ArgumentException("Your cart is empty.");

        var orderItems = new List<OrderItem>();
        decimal totalAmount = 0;

        foreach (var cartItem in cart.CartItems)
        {
            if (cartItem.Product.Stock < cartItem.Quantity)
                throw new ArgumentException(
                    $"{cartItem.Product.Name} has insufficient stock. Available: {cartItem.Product.Stock}");

            var finalPrice = cartItem.Product.HasDiscount ? cartItem.Product.FinalPrice : cartItem.Product.Price;

            orderItems.Add(new OrderItem
            {
                ProductId = cartItem.ProductId,
                Quantity = cartItem.Quantity,
                UnitPrice = finalPrice,
                SelectedColor = cartItem.SelectedColor,
                SelectedSize = cartItem.SelectedSize
            });

            totalAmount += finalPrice * cartItem.Quantity;
            cartItem.Product.Stock -= cartItem.Quantity;
        }

        var order = new Order
        {
            UserId = userId,
            OrderDate = DateTime.UtcNow,
            Status = "Pending",
            TotalAmount = totalAmount,
            DeliveryAddress = dto.DeliveryAddress,
            PhoneNumber = dto.PhoneNumber,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            LocationAddress = dto.LocationAddress ?? string.Empty,
            OrderItems = orderItems
        };

        _context.Orders.Add(order);
        _context.CartItems.RemoveRange(cart.CartItems);

        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.SuccessResponse(
            new
            {
                OrderId = order.Id,
                TotalAmount = totalAmount,
                Status = "Pending",
                PhoneNumber = order.PhoneNumber
            },
            "Order placed successfully."
        ));
    }
}

// Checkout DTO for cart checkout
public class CartCheckoutDto
{
    public string DeliveryAddress { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string LocationAddress { get; set; } = string.Empty;
}
