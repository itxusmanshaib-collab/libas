using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Solera.API.DTOs;
using Solera.API.Helpers;
using Solera.Infrastructure.Data;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Solera.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Sirf logged in user
public class ProfileController : ControllerBase
{
    private readonly SoleraDbContext _context;

    public ProfileController(SoleraDbContext context)
    {
        _context = context;
    }

    // JWT token se logged in user ki Id nikalo
    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst("sub")?.Value
                       ?? User.FindFirst("userId")?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            throw new UnauthorizedAccessException("Invalid or missing user identity.");
        return userId;
    }

    // Password hash karne ka function
    // AuthController jaisa — same algorithm
    private string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }

    // ─────────────────────────────────────────
    // GET api/profile
    // Apni profile dekho
    // ─────────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var userId = GetCurrentUserId();

        // User dhundo — orders ke saath
        var user = await _context.Users
            .Include(u => u.Orders)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return NotFound(
                ApiResponse<object>.ErrorResponse(
                    "User not found.",
                    StatusCodes.Status404NotFound
                ));
        }

        // Profile response banao
        var profile = new ProfileResponseDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            CreatedAt = user.CreatedAt,

            // Kitne orders kiye
            TotalOrders = user.Orders.Count,

            // Sirf delivered orders ka total
            // Cancelled orders count nahi honge
            TotalSpent = user.Orders
                .Where(o => o.Status == "Delivered")
                .Sum(o => o.TotalAmount)
        };

        return Ok(ApiResponse<ProfileResponseDto>.SuccessResponse(
            profile,
            "Profile retrieved successfully."
        ));


    }

    // ─────────────────────────────────────────
    // PUT api/profile
    // Profile update karo — sirf naam
    // ─────────────────────────────────────────
    [HttpPut]
    public async Task<IActionResult> UpdateProfile(
        [FromBody] UpdateProfileDto dto)
    {
        // Naam khali nahi hona chahiye
        if (string.IsNullOrWhiteSpace(dto.FullName))
            return BadRequest(ApiResponse<object>.ErrorResponse(
     "Full name is required.",
     StatusCodes.Status400BadRequest
 ));

        var userId = GetCurrentUserId();

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return NotFound(ApiResponse<object>.ErrorResponse(
    "User not found.",
    StatusCodes.Status404NotFound
));

        // Naam update karo
        user.FullName = dto.FullName;
        await _context.SaveChangesAsync();

        var response = new
        {
            user.FullName,
            user.Email
        };

        return Ok(ApiResponse<object>.SuccessResponse(
            response,
            "Profile updated successfully."
        ));
    }

    // ─────────────────────────────────────────
    // PUT api/profile/change-password
    // Password change karo
    // ─────────────────────────────────────────
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordDto dto)
    {
        // Naya password aur confirm match karte hain?
        if (dto.NewPassword != dto.ConfirmNewPassword)
            return BadRequest(ApiResponse<object>.ErrorResponse(
    "New password and confirmation password do not match.",
    StatusCodes.Status400BadRequest
));

        // Password minimum 6 characters
        if (dto.NewPassword.Length < 6)
            return BadRequest("Password kam se kam 6 characters ka hona chahiye");

        var userId = GetCurrentUserId();

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return BadRequest(ApiResponse<object>.ErrorResponse(
     "Password must be at least 6 characters long.",
     StatusCodes.Status400BadRequest
 ));

        // Purana password verify karo
        var currentHash = HashPassword(dto.CurrentPassword);
        if (user.PasswordHash != currentHash)
            return BadRequest(ApiResponse<object>.ErrorResponse(
    "Current password is incorrect.",
    StatusCodes.Status400BadRequest
));

        // Naya password hash karke save karo
        user.PasswordHash = HashPassword(dto.NewPassword);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.SuccessResponse(
     null,
     "Password changed successfully."
 ));
    }

    // ─────────────────────────────────────────
    // GET api/profile/orders
    // Apne sab orders dekho — My Orders page
    // ─────────────────────────────────────────
    [HttpGet("orders")]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = GetCurrentUserId();

        var orders = await _context.Orders
            .Where(o => o.UserId == userId)
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

                // Har order mein kya kya tha
                Items = o.OrderItems.Select(oi => new
                {
                    ProductName = oi.Product.Name,
                    ProductImage = oi.Product.ImageUrl,
                    oi.Quantity,
                    oi.UnitPrice,
                    SubTotal = oi.Quantity * oi.UnitPrice
                })
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.SuccessResponse(
     orders,
     "Orders retrieved successfully."
 ));
    }

    // ─────────────────────────────────────────
    // GET api/profile/orders/5
    // Ek order ki full detail
    // ─────────────────────────────────────────
    [HttpGet("orders/{orderId}")]
    public async Task<IActionResult> GetOrderDetail(int orderId)
    {
        var userId = GetCurrentUserId();

        var order = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .FirstOrDefaultAsync(o =>
                o.Id == orderId &&
                o.UserId == userId // Apna order hi dekh sakta hai
            );

        if (order == null)
            return NotFound(ApiResponse<object>.ErrorResponse(
     "Order not found.",
     StatusCodes.Status404NotFound
 ));

        var response = new
        {
            order.Id,
            order.OrderDate,
            order.Status,
            order.TotalAmount,
            order.DeliveryAddress,
            Items = order.OrderItems.Select(oi => new
            {
                ProductName = oi.Product.Name,
                ProductImage = oi.Product.ImageUrl,
                oi.Quantity,
                oi.UnitPrice,
                SubTotal = oi.Quantity * oi.UnitPrice
            }),

            // Status history — Angular mein stepper dikhega
            StatusInfo = new
            {
                IsPending = order.Status == "Pending",
                IsProcessing = order.Status == "Processing",
                IsShipped = order.Status == "Shipped",
                IsDelivered = order.Status == "Delivered",
                IsCancelled = order.Status == "Cancelled"
            }
        };

        return Ok(ApiResponse<object>.SuccessResponse(
     response,
     "Order details retrieved successfully."
 ));
    }
}