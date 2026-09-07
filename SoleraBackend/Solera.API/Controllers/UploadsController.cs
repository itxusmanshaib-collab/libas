using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Solera.API.Helpers;

namespace Solera.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UploadsController : ControllerBase
{
    private readonly IWebHostEnvironment _env;

    public UploadsController(IWebHostEnvironment env)
    {
        _env = env;
    }

    [HttpPost("image")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "No file uploaded", 400));

        // Validate file type
        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "Only JPG, PNG, WebP, and GIF files are allowed", 400));

        // Max 5MB
        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "File size must be less than 5MB", 400));

        var uploadsDir = Path.Combine(_env.WebRootPath, "uploads", "products");

        // Create directory if it doesn't exist
        if (!Directory.Exists(uploadsDir))
            Directory.CreateDirectory(uploadsDir);

        // Generate unique filename
        var extension = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsDir, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Return the URL path relative to the server
        var imageUrl = $"uploads/products/{fileName}";

        return Ok(ApiResponse<object>.SuccessResponse(
            new { imageUrl, fileName },
            "Image uploaded successfully"));
    }

    [HttpPost("category-image")]
    public async Task<IActionResult> UploadCategoryImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "No file uploaded", 400));

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "Only JPG, PNG, WebP, and GIF files are allowed", 400));

        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "File size must be less than 5MB", 400));

        var uploadsDir = Path.Combine(_env.WebRootPath, "uploads", "categories");

        if (!Directory.Exists(uploadsDir))
            Directory.CreateDirectory(uploadsDir);

        var extension = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsDir, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var imageUrl = $"uploads/categories/{fileName}";

        return Ok(ApiResponse<object>.SuccessResponse(
            new { imageUrl, fileName },
            "Category image uploaded successfully"));
    }

    [HttpPost("banner-image")]
    public async Task<IActionResult> UploadBannerImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "No file uploaded", 400));

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "Only JPG, PNG, WebP, and GIF files are allowed", 400));

        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "File size must be less than 5MB", 400));

        var uploadsDir = Path.Combine(_env.WebRootPath, "uploads", "banners");

        if (!Directory.Exists(uploadsDir))
            Directory.CreateDirectory(uploadsDir);

        var extension = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsDir, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var imageUrl = $"uploads/banners/{fileName}";

        return Ok(ApiResponse<object>.SuccessResponse(
            new { imageUrl, fileName },
            "Banner image uploaded successfully"));
    }
}
