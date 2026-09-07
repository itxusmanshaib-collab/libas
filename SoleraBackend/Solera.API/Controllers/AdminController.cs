using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Solera.API.DTOs;
using Solera.API.Helpers;
using Solera.Domain.Entities;
using Solera.Domain.Interfaces;
using Solera.Infrastructure.Data;

namespace Solera.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly SoleraDbContext _context;

    public AdminController(
        IUnitOfWork unitOfWork,
        SoleraDbContext context)
    {
        _unitOfWork = unitOfWork;
        _context = context;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var totalProducts = await _context.Products.CountAsync();
        var totalOrders = await _context.Orders.CountAsync();
        var totalUsers = await _context.Users.CountAsync();

        var totalRevenue = await _context.Orders
            .Where(o => o.Status == "Delivered")
            .SumAsync(o => o.TotalAmount);

        var pendingOrders = await _context.Orders
            .Where(o => o.Status == "Pending")
            .CountAsync();

        var dashboard = new
        {
            TotalProducts = totalProducts,
            TotalOrders = totalOrders,
            TotalUsers = totalUsers,
            TotalRevenue = totalRevenue,
            PendingOrders = pendingOrders
        };

        return Ok(ApiResponse<object>.SuccessResponse(
            dashboard, "Dashboard data retrieved successfully"));
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _context.Users
            .Select(u => new
            {
                u.Id,
                u.FullName,
                u.Email,
                u.Role,
                u.CreatedAt,
                OrderCount = u.Orders.Count
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.SuccessResponse(
            users, "Users retrieved successfully"));
    }

    [HttpGet("users/{id}")]
    public async Task<IActionResult> GetUserById(int id)
    {
        var user = await _context.Users
            .Include(u => u.Orders)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return NotFound(ApiResponse<object>.ErrorResponse(
                $"User {id} not found", 404));

        var response = new
        {
            user.Id,
            user.FullName,
            user.Email,
            user.Role,
            user.CreatedAt,
            Orders = user.Orders.Select(o => new
            {
                o.Id,
                o.OrderDate,
                o.Status,
                o.TotalAmount
            })
        };

        return Ok(ApiResponse<object>.SuccessResponse(
            response, "User retrieved successfully"));
    }

    [HttpPut("users/{id}/role")]
    public async Task<IActionResult> UpdateUserRole(
        int id, [FromBody] string role)
    {
        if (role != "User" && role != "Admin")
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "Role must be 'User' or 'Admin'", 400));

        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(ApiResponse<object>.ErrorResponse(
                $"User {id} not found", 404));

        user.Role = role;
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.SuccessResponse(
            new { user.Id, user.FullName, Role = role },
            $"{user.FullName}'s role updated to {role}"));
    }

    [HttpGet("orders")]
    public async Task<IActionResult> GetAllOrders()
    {
        var orders = await _context.Orders
            .Include(o => o.User)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .OrderByDescending(o => o.OrderDate)
            .Select(o => new
            {
                o.Id,
                o.OrderDate,
                o.Status,
                o.TotalAmount,
                o.DeliveryAddress,
                o.PhoneNumber,
                o.Latitude,
                o.Longitude,
                o.LocationAddress,
                User = new
                {
                    o.User.FullName,
                    o.User.Email
                },
                Items = o.OrderItems.Select(oi => new
                {
                    oi.Product.Name,
                    oi.SelectedColor,
                    oi.SelectedSize,
                    oi.Quantity,
                    oi.UnitPrice
                })
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.SuccessResponse(
            orders, "Orders retrieved successfully"));
    }

    [HttpPut("orders/{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(
        int id, [FromBody] string status)
    {
        var validStatuses = new[]
        {
            "Pending", "Processing", "Shipped", "Delivered", "Cancelled"
        };

        if (!validStatuses.Contains(status))
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "Invalid status", 400));

        var order = await _context.Orders.FindAsync(id);
        if (order == null)
            return NotFound(ApiResponse<object>.ErrorResponse(
                $"Order {id} not found", 404));

        order.Status = status;
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.SuccessResponse(
            new { OrderId = id, Status = status },
            $"Order status updated to '{status}'"));
    }

    [HttpGet("products")]
    public async Task<IActionResult> GetAllProducts()
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Ok(ApiResponse<List<Product>>.SuccessResponse(
            products, "Products retrieved successfully"));
    }

    [HttpPut("products/{id}/toggle")]
    public async Task<IActionResult> ToggleProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
            return NotFound(ApiResponse<object>.ErrorResponse(
                $"Product {id} not found", 404));

        product.IsActive = !product.IsActive;
        await _context.SaveChangesAsync();

        var status = product.IsActive ? "Active" : "Inactive";
        return Ok(ApiResponse<object>.SuccessResponse(
            new { product.Id, product.IsActive },
            $"Product is now {status}"));
    }
}
