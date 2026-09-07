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
public class ReviewsController : ControllerBase
{
    private readonly SoleraDbContext _context;

    public ReviewsController(SoleraDbContext context)
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

    // ─────────────────────────────────────────
    // GET api/reviews/product/1
    // Product ke approved reviews
    // Public — sab dekh sakte hain
    // ─────────────────────────────────────────
    [HttpGet("product/{productId}")]
    public async Task<IActionResult> GetProductReviews(int productId)
    {
        var reviews = await _context.Reviews
            .Where(r => r.ProductId == productId && r.IsApproved)
            .Include(r => r.User)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.Rating,
                r.Comment,
                r.CreatedAt,
                UserName = r.User.FullName
            })
            .ToListAsync();

        // Average rating calculate karo
        var avgRating = reviews.Any()
            ? reviews.Average(r => r.Rating)
            : 0;

        var response = new
        {
            AverageRating = Math.Round(avgRating, 1),
            TotalReviews = reviews.Count,
            Reviews = reviews
        };

        return Ok(ApiResponse<object>.SuccessResponse(
            response, "Reviews mil gaye"
        ));
    }

    // ─────────────────────────────────────────
    // POST api/reviews
    // Review submit karo — logged in user
    // ─────────────────────────────────────────
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> AddReview([FromBody] CreateReviewDto dto)
    {
        // Rating 1-5 ke beech hona chahiye
        if (dto.Rating < 1 || dto.Rating > 5)
            return BadRequest(ApiResponse<Review>.ErrorResponse(
                "Rating 1 se 5 ke beech honi chahiye", 400
            ));

        var userId = GetCurrentUserId();

        // Product exist karta hai?
        var product = await _context.Products.FindAsync(dto.ProductId);
        if (product == null)
            return NotFound(ApiResponse<Review>.ErrorResponse(
                "Product nahi mila", 404
            ));

        // User ne yeh product kharida tha?
        var hasPurchased = await _context.Orders
            .AnyAsync(o =>
                o.UserId == userId &&
                o.Status == "Delivered" &&
                o.OrderItems.Any(oi => oi.ProductId == dto.ProductId)
            );

        if (!hasPurchased)
            return BadRequest(ApiResponse<Review>.ErrorResponse(
                "Sirf purchased products ka review de sakte hain", 400
            ));

        // Pehle se review diya hua toh nahi?
        var existingReview = await _context.Reviews
            .FirstOrDefaultAsync(r =>
                r.UserId == userId &&
                r.ProductId == dto.ProductId
            );

        if (existingReview != null)
            return BadRequest(ApiResponse<Review>.ErrorResponse(
                "Aap pehle se yeh product review kar chuke hain", 400
            ));

        var review = new Review
        {
            ProductId = dto.ProductId,
            UserId = userId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            IsApproved = false, // Admin approve karega
            CreatedAt = DateTime.UtcNow
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.SuccessResponse(
            null!, "Review submit ho gaya — admin approval ke baad dikhega"
        ));
    }

    // ─────────────────────────────────────────
    // GET api/reviews/pending — Admin
    // Pending reviews — approve karne ke liye
    // ─────────────────────────────────────────
    [HttpGet("pending")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetPendingReviews()
    {
        var reviews = await _context.Reviews
            .Where(r => !r.IsApproved)
            .Include(r => r.User)
            .Include(r => r.Product)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.Rating,
                r.Comment,
                r.CreatedAt,
                UserName = r.User.FullName,
                ProductName = r.Product.Name
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.SuccessResponse(
            reviews, $"{reviews.Count} pending reviews"
        ));
    }

    // ─────────────────────────────────────────
    // PUT api/reviews/1/approve — Admin
    // Review approve karo
    // ─────────────────────────────────────────
    [HttpPut("{id}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ApproveReview(int id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null)
            return NotFound(ApiResponse<Review>.ErrorResponse(
                "Review nahi mila", 404
            ));

        review.IsApproved = true;
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.SuccessResponse(
            null!, "Review approve ho gaya"
        ));
    }

    // ─────────────────────────────────────────
    // DELETE api/reviews/1 — Admin
    // Review delete karo
    // ─────────────────────────────────────────
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteReview(int id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null)
            return NotFound(ApiResponse<Review>.ErrorResponse(
                "Review nahi mila", 404
            ));

        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.SuccessResponse(
            null!, "Review delete ho gaya"
        ));
    }
}