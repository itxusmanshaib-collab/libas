using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Solera.API.DTOs;
using Solera.API.Helpers;
using Solera.Domain.Entities;
using Solera.Domain.Interfaces;
using System.Security.Claims;

namespace Solera.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    public ProductsController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var products = await _unitOfWork.Products.GetAllAsync();

        return Ok(ApiResponse<IEnumerable<Product>>
            .SuccessResponse(
                products,
                "Products fetched successfully"
            ));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id);

        if (product == null)
        {
            return NotFound(
                ApiResponse<Product>.ErrorResponse(
                    $"Product {id} not found",
                    404
                ));
        }

        return Ok(
            ApiResponse<Product>.SuccessResponse(
                product,
                "Product fetched successfully"
            ));
    }

    [HttpGet("category/{categoryId}")]
    public async Task<IActionResult> GetByCategory(int categoryId)
    {
        var products = await _unitOfWork.Products
                             .GetByCategoryAsync(categoryId);
        return Ok(
            ApiResponse<IEnumerable<Product>>
            .SuccessResponse(
                products,
                "Category products fetched successfully"
            ));
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string keyword)
    {
        if (string.IsNullOrWhiteSpace(keyword))
        {
            return BadRequest(
                ApiResponse<object>.ErrorResponse(
                    "Keyword is required",
                    400
                ));
        }

        var products = await _unitOfWork.Products.SearchAsync(keyword);

        return Ok(
            ApiResponse<IEnumerable<Product>>
            .SuccessResponse(
                products,
                "Search completed successfully"
            ));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateProductDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            Stock = dto.Stock,
            ImageUrl = dto.ImageUrl,
            GalleryImages = dto.GalleryImages,
            AvailableColors = dto.AvailableColors,
            AvailableSizes = dto.AvailableSizes,
            CategoryId = dto.CategoryId,
            DiscountPercentage = dto.DiscountPercentage,
            DiscountAmount = dto.DiscountAmount,
            IsActive = true
        };

        await _unitOfWork.Products.AddAsync(product);
        await _unitOfWork.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = product.Id },
            ApiResponse<Product>.SuccessResponse(
                product,
                "Product created successfully",
                201
            )
        );
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProductDto dto)
    {
        var existing = await _unitOfWork.Products.GetByIdAsync(id);
        if (existing == null)
            return NotFound(
                ApiResponse<object>.ErrorResponse(
                    $"Product {id} not found",
                    404
                ));

        existing.Name = dto.Name;
        existing.Description = dto.Description;
        existing.Price = dto.Price;
        existing.Stock = dto.Stock;
        existing.ImageUrl = dto.ImageUrl;
        existing.GalleryImages = dto.GalleryImages;
        existing.AvailableColors = dto.AvailableColors;
        existing.AvailableSizes = dto.AvailableSizes;
        existing.IsActive = dto.IsActive;
        existing.CategoryId = dto.CategoryId;
        existing.DiscountPercentage = dto.DiscountPercentage;
        existing.DiscountAmount = dto.DiscountAmount;

        _unitOfWork.Products.Update(existing);
        await _unitOfWork.SaveChangesAsync();

        return Ok(
            ApiResponse<Product>.SuccessResponse(
                existing,
                "Product updated successfully"
            ));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id);

        if (product == null)
            return NotFound(
                ApiResponse<object>.ErrorResponse(
                    $"Product {id} not found",
                    404
                ));

        _unitOfWork.Products.Delete(product);
        await _unitOfWork.SaveChangesAsync();

        return Ok(
            ApiResponse<object>.SuccessResponse(
                null,
                "Product deleted successfully"
            ));
    }

    // Wishlist endpoints
    [HttpPost("wishlist/{productId}")]
    [Authorize]
    public async Task<IActionResult> AddToWishlist(int productId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
            return Unauthorized();

        var userId = int.Parse(userIdClaim);

        // Check if already in wishlist
        var existing = await _unitOfWork.Wishlists.GetByUserAndProductAsync(userId, productId);
        if (existing != null)
            return Ok(ApiResponse<object>.SuccessResponse(null, "Already in wishlist"));

        var wishlist = new Wishlist
        {
            UserId = userId,
            ProductId = productId,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Wishlists.AddAsync(wishlist);
        await _unitOfWork.SaveChangesAsync();

        return Ok(ApiResponse<object>.SuccessResponse(null, "Added to wishlist successfully"));
    }

    [HttpGet("wishlist")]
    [Authorize]
    public async Task<IActionResult> GetWishlist()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
            return Unauthorized();

        var userId = int.Parse(userIdClaim);
        var wishlistItems = await _unitOfWork.Wishlists.GetByUserIdAsync(userId);

        return Ok(ApiResponse<IEnumerable<Wishlist>>.SuccessResponse(
            wishlistItems,
            "Wishlist fetched successfully"
        ));
    }

    [HttpDelete("wishlist/{productId}")]
    [Authorize]
    public async Task<IActionResult> RemoveFromWishlist(int productId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
            return Unauthorized();

        var userId = int.Parse(userIdClaim);

        var wishlist = await _unitOfWork.Wishlists.GetByUserAndProductAsync(userId, productId);
        if (wishlist == null)
            return NotFound(ApiResponse<object>.ErrorResponse("Item not in wishlist", 404));

        _unitOfWork.Wishlists.Delete(wishlist);
        await _unitOfWork.SaveChangesAsync();

        return Ok(ApiResponse<object>.SuccessResponse(null, "Removed from wishlist"));
    }
}
