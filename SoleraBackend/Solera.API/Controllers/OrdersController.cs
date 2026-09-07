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
public class OrdersController : ControllerBase
{
    private readonly SoleraDbContext _context;

    public OrdersController(SoleraDbContext context)
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

    [HttpPost]
    public async Task<IActionResult> PlaceOrder([FromBody] CreateOrderDto dto)
    {
        if (dto.Items == null || !dto.Items.Any())
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "Order must contain at least one item", 400));

        var userId = GetCurrentUserId();
        var orderItems = new List<OrderItem>();
        decimal totalAmount = 0;

        foreach (var item in dto.Items)
        {
            var product = await _context.Products.FindAsync(item.ProductId);

            if (product == null)
                return NotFound(ApiResponse<object>.ErrorResponse(
                    $"Product {item.ProductId} not found", 404));

            if (!product.IsActive)
                return BadRequest(ApiResponse<object>.ErrorResponse(
                    $"{product.Name} is currently unavailable", 400));

            if (product.Stock < item.Quantity)
                return BadRequest(ApiResponse<object>.ErrorResponse(
                    $"{product.Name} has insufficient stock. Available: {product.Stock}, Requested: {item.Quantity}", 400));

            var orderItem = new OrderItem
            {
                ProductId = product.Id,
                Quantity = item.Quantity,
                UnitPrice = product.FinalPrice
            };

            orderItems.Add(orderItem);
            totalAmount += product.FinalPrice * item.Quantity;
            product.Stock -= item.Quantity;
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
            LocationAddress = dto.LocationAddress,
            OrderItems = orderItems
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        var response = new OrderResponseDto
        {
            OrderId = order.Id,
            Status = order.Status,
            TotalAmount = order.TotalAmount,
            OrderDate = order.OrderDate,
            DeliveryAddress = order.DeliveryAddress,
            PhoneNumber = order.PhoneNumber,
            Latitude = order.Latitude,
            Longitude = order.Longitude,
            LocationAddress = order.LocationAddress,
            Items = order.OrderItems.Select(oi => new OrderItemResponseDto
            {
                ProductName = oi.Product?.Name ?? "Product",
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                SubTotal = oi.Quantity * oi.UnitPrice
            }).ToList()
        };

        return CreatedAtAction(nameof(GetOrderById),
            new { id = order.Id },
            ApiResponse<OrderResponseDto>.SuccessResponse(response, "Order placed successfully", 201));
    }

    [HttpGet]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = GetCurrentUserId();

        var orders = await _context.Orders
            .Where(o => o.UserId == userId)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .OrderByDescending(o => o.OrderDate)
            .Select(o => new OrderResponseDto
            {
                OrderId = o.Id,
                Status = o.Status,
                TotalAmount = o.TotalAmount,
                OrderDate = o.OrderDate,
                DeliveryAddress = o.DeliveryAddress,
                PhoneNumber = o.PhoneNumber,
                Latitude = o.Latitude,
                Longitude = o.Longitude,
                LocationAddress = o.LocationAddress,
                Items = o.OrderItems.Select(oi => new OrderItemResponseDto
                {
                    ProductName = oi.Product.Name,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    SubTotal = oi.Quantity * oi.UnitPrice
                }).ToList()
            })
            .ToListAsync();

        return Ok(ApiResponse<List<OrderResponseDto>>.SuccessResponse(
            orders, "Orders retrieved successfully"));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrderById(int id)
    {
        var userId = GetCurrentUserId();

        var order = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            return NotFound(ApiResponse<object>.ErrorResponse(
                $"Order {id} not found", 404));

        if (order.UserId != userId)
            return Forbid();

        var response = new OrderResponseDto
        {
            OrderId = order.Id,
            Status = order.Status,
            TotalAmount = order.TotalAmount,
            OrderDate = order.OrderDate,
            DeliveryAddress = order.DeliveryAddress,
            PhoneNumber = order.PhoneNumber,
            Latitude = order.Latitude,
            Longitude = order.Longitude,
            LocationAddress = order.LocationAddress,
            Items = order.OrderItems.Select(oi => new OrderItemResponseDto
            {
                ProductName = oi.Product.Name,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                SubTotal = oi.Quantity * oi.UnitPrice
            }).ToList()
        };

        return Ok(ApiResponse<OrderResponseDto>.SuccessResponse(
            response, "Order retrieved successfully"));
    }

    [HttpPut("{id}/cancel")]
    public async Task<IActionResult> CancelOrder(int id)
    {
        var userId = GetCurrentUserId();

        var order = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            return NotFound(ApiResponse<object>.ErrorResponse(
                $"Order {id} not found", 404));

        if (order.UserId != userId)
            return Forbid();

        if (order.Status != "Pending")
            return BadRequest(ApiResponse<object>.ErrorResponse(
                $"Order cannot be cancelled. Current status: {order.Status}", 400));

        order.Status = "Cancelled";

        foreach (var item in order.OrderItems)
        {
            if (item.Product != null)
                item.Product.Stock += item.Quantity;
        }

        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.SuccessResponse(
            new { OrderId = id, Status = "Cancelled" },
            "Order cancelled successfully"));
    }
}
