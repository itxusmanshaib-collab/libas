//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;
//using Solera.API.DTOs;
//using Solera.API.Helpers;
//using Solera.Domain.Entities;
//using Solera.Infrastructure.Data;

//namespace Solera.API.Controllers;

//[ApiController]
//[Route("api/[controller]")]
//public class CategoriesController : ControllerBase
//{
//    private readonly SoleraDbContext _context;

//    public CategoriesController(SoleraDbContext context)
//    {
//        _context = context;
//    }

//    // ─────────────────────────────────────────
//    // GET api/categories
//    // Sab categories — products count ke saath
//    // Koi bhi dekh sakta hai — login zarori nahi
//    // Angular sidebar ke liye
//    // ─────────────────────────────────────────
//    [HttpGet]
//    public async Task<IActionResult> GetAll()
//    {
//        var categories = await _context.Categories
//            .Select(c => new CategoryResponseDto
//            {
//                Id = c.Id,
//                Name = c.Name,
//                Description = c.Description,
//                ImageUrl = c.ImageUrl,

//                // Sirf active products count karo
//                ProductCount = c.Products
//                    .Count(p => p.IsActive)
//            })
//            .ToListAsync();

//        return Ok(ApiResponse<List<CategoryResponseDto>>.SuccessResponse(
//    categories,
//    "Categories successfully fetched"
//));
//    }

//    // ─────────────────────────────────────────
//    // GET api/categories/3
//    // Ek category — us ke products ke saath
//    // ─────────────────────────────────────────
//    [HttpGet("{id}")]
//    public async Task<IActionResult> GetById(int id)
//    {
//        var category = await _context.Categories
//            .Include(c => c.Products.Where(p => p.IsActive))
//            .FirstOrDefaultAsync(c => c.Id == id);

//        if (category == null)
//            return NotFound($"Category {id} nahi mili");

//        // Response mein category + products dono
//        var response = new
//        {
//            category.Id,
//            category.Name,
//            category.Description,
//            category.ImageUrl,
//            ProductCount = category.Products.Count,

//            // Products ki list bhi saath
//            Products = category.Products.Select(p => new
//            {
//                p.Id,
//                p.Name,
//                p.Price,
//                p.Stock,
//                p.ImageUrl,
//                p.IsActive
//            })
//        };

//        return Ok(response);
//    }

//    // ─────────────────────────────────────────
//    // POST api/categories
//    // Nai category banao — sirf Admin
//    // ─────────────────────────────────────────
//    [HttpPost]
//    [Authorize(Roles = "Admin")]
//    public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto)
//    {
//        // Same naam ki category pehle se toh nahi?
//        var existing = await _context.Categories
//            .FirstOrDefaultAsync(c => c.Name == dto.Name);

//        if (existing != null)
//            return BadRequest($"'{dto.Name}' category pehle se exist karti hai");

//        var category = new Category
//        {
//            Name = dto.Name,
//            Description = dto.Description,
//            ImageUrl = dto.ImageUrl
//        };

//        _context.Categories.Add(category);
//        await _context.SaveChangesAsync();

//        return CreatedAtAction(nameof(GetById),
//            new { id = category.Id },
//            new CategoryResponseDto
//            {
//                Id = category.Id,
//                Name = category.Name,
//                Description = category.Description,
//                ImageUrl = category.ImageUrl,
//                ProductCount = 0
//            });
//    }

//    // ─────────────────────────────────────────
//    // PUT api/categories/3
//    // Category update karo — sirf Admin
//    // ─────────────────────────────────────────
//    [HttpPut("{id}")]
//    [Authorize(Roles = "Admin")]
//    public async Task<IActionResult> Update(
//        int id, [FromBody] UpdateCategoryDto dto)
//    {
//        var category = await _context.Categories.FindAsync(id);

//        if (category == null)
//            return NotFound($"Category {id} nahi mili");

//        // Same naam ki doosri category toh nahi?
//        var duplicate = await _context.Categories
//            .FirstOrDefaultAsync(c => c.Name == dto.Name && c.Id != id);

//        if (duplicate != null)
//            return BadRequest($"'{dto.Name}' naam ki category pehle se hai");

//        // Update karo
//        category.Name = dto.Name;
//        category.Description = dto.Description;
//        category.ImageUrl = dto.ImageUrl;

//        await _context.SaveChangesAsync();

//        return Ok(new CategoryResponseDto
//        {
//            Id = category.Id,
//            Name = category.Name,
//            Description = category.Description,
//            ImageUrl = category.ImageUrl
//        });
//    }

//    // ─────────────────────────────────────────
//    // DELETE api/categories/3
//    // Category delete karo — sirf Admin
//    // ─────────────────────────────────────────
//    [HttpDelete("{id}")]
//    [Authorize(Roles = "Admin")]
//    public async Task<IActionResult> Delete(int id)
//    {
//        var category = await _context.Categories
//            .Include(c => c.Products)
//            .FirstOrDefaultAsync(c => c.Id == id);

//        if (category == null)
//            return NotFound($"Category {id} nahi mili");

//        // Agar is category mein products hain — delete mat karo
//        // Pehle products ko doosri category mein move karo
//        if (category.Products.Any())
//            return BadRequest(
//                $"Category delete nahi ho sakti — " +
//                $"is mein {category.Products.Count} products hain. " +
//                $"Pehle products ko doosri category mein move karo."
//            );

//        _context.Categories.Remove(category);
//        await _context.SaveChangesAsync();

//        return Ok(new { Message = $"'{category.Name}' category delete ho gayi" });
//    }

//    // ─────────────────────────────────────────
//    // GET api/categories/3/products
//    // Ek category ke sab products
//    // Angular mein category page ke liye
//    // ─────────────────────────────────────────
//    [HttpGet("{id}/products")]
//    public async Task<IActionResult> GetProducts(int id)
//    {
//        // Category exist karti hai?
//        var categoryExists = await _context.Categories
//            .AnyAsync(c => c.Id == id);

//        if (!categoryExists)
//            return NotFound($"Category {id} nahi mili");

//        // Is category ke active products
//        var products = await _context.Products
//            .Where(p => p.CategoryId == id && p.IsActive)
//            .OrderBy(p => p.Name)
//            .Select(p => new
//            {
//                p.Id,
//                p.Name,
//                p.Description,
//                p.Price,
//                p.Stock,
//                p.ImageUrl
//            })
//            .ToListAsync();

//        return Ok(products);
//    }
//}
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Solera.API.DTOs;
using Solera.API.Helpers;
using Solera.Domain.Entities;
using Solera.Infrastructure.Data;

namespace Solera.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly SoleraDbContext _context;

    public CategoriesController(SoleraDbContext context)
    {
        _context = context;
    }

    // ─────────────────────────────────────────
    // GET api/categories
    // All categories with active product count
    // Public — no authentication required
    // Used by the Angular sidebar
    // ─────────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _context.Categories
            .Select(c => new CategoryResponseDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                ImageUrl = c.ImageUrl,

                // Only count active products
                ProductCount = c.Products
                    .Count(p => p.IsActive)
            })
            .ToListAsync();

        return Ok(ApiResponse<List<CategoryResponseDto>>.SuccessResponse(
            categories,
            "Categories retrieved successfully"
        ));
    }

    // ─────────────────────────────────────────
    // GET api/categories/3
    // A single category with its products
    // ─────────────────────────────────────────
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var category = await _context.Categories
            .Include(c => c.Products.Where(p => p.IsActive))
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
            return NotFound(ApiResponse<object>.ErrorResponse(
                $"Category with id {id} was not found",
                StatusCodes.Status404NotFound
            ));

        var response = new
        {
            category.Id,
            category.Name,
            category.Description,
            category.ImageUrl,
            ProductCount = category.Products.Count,

            Products = category.Products.Select(p => new
            {
                p.Id,
                p.Name,
                p.Price,
                p.Stock,
                p.ImageUrl,
                p.IsActive
            })
        };

        return Ok(ApiResponse<object>.SuccessResponse(
            response,
            "Category retrieved successfully"
        ));
    }

    // ─────────────────────────────────────────
    // POST api/categories
    // Create a new category — Admin only
    // ─────────────────────────────────────────
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto)
    {
        // Check for an existing category with the same name
        var existing = await _context.Categories
            .FirstOrDefaultAsync(c => c.Name == dto.Name);

        if (existing != null)
            return BadRequest(ApiResponse<object>.ErrorResponse(
                $"A category named '{dto.Name}' already exists",
                StatusCodes.Status400BadRequest
            ));

        var category = new Category
        {
            Name = dto.Name,
            Description = dto.Description,
            ImageUrl = dto.ImageUrl
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        var responseDto = new CategoryResponseDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            ImageUrl = category.ImageUrl,
            ProductCount = 0
        };

        return CreatedAtAction(nameof(GetById),
            new { id = category.Id },
            ApiResponse<CategoryResponseDto>.SuccessResponse(
                responseDto,
                "Category created successfully",
                StatusCodes.Status201Created
            ));
    }

    // ─────────────────────────────────────────
    // PUT api/categories/3
    // Update a category — Admin only
    // ─────────────────────────────────────────
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(
        int id, [FromBody] UpdateCategoryDto dto)
    {
        var category = await _context.Categories.FindAsync(id);

        if (category == null)
            return NotFound(ApiResponse<object>.ErrorResponse(
                $"Category with id {id} was not found",
                StatusCodes.Status404NotFound
            ));

        // Check if another category already uses this name
        var duplicate = await _context.Categories
            .FirstOrDefaultAsync(c => c.Name == dto.Name && c.Id != id);

        if (duplicate != null)
            return BadRequest(ApiResponse<object>.ErrorResponse(
                $"A category named '{dto.Name}' already exists",
                StatusCodes.Status400BadRequest
            ));

        category.Name = dto.Name;
        category.Description = dto.Description;
        category.ImageUrl = dto.ImageUrl;

        await _context.SaveChangesAsync();

        var responseDto = new CategoryResponseDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            ImageUrl = category.ImageUrl,
            ProductCount = await _context.Products.CountAsync(p => p.CategoryId == id && p.IsActive)
        };

        return Ok(ApiResponse<CategoryResponseDto>.SuccessResponse(
            responseDto,
            "Category updated successfully"
        ));
    }

    // ─────────────────────────────────────────
    // DELETE api/categories/3
    // Delete a category — Admin only
    // ─────────────────────────────────────────
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var category = await _context.Categories
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
            return NotFound(ApiResponse<object>.ErrorResponse(
                $"Category with id {id} was not found",
                StatusCodes.Status404NotFound
            ));

        // Don't delete if the category still has products
        // Move the products to another category first
        if (category.Products.Any())
            return BadRequest(ApiResponse<object>.ErrorResponse(
                $"Category cannot be deleted — it still has {category.Products.Count} product(s). " +
                "Please move these products to another category first.",
                StatusCodes.Status400BadRequest
            ));

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.SuccessResponse(
            new { },
            $"Category '{category.Name}' deleted successfully"
        ));
    }

    // ─────────────────────────────────────────
    // GET api/categories/3/products
    // All products belonging to a category
    // Used by the Angular category page
    // ─────────────────────────────────────────
    [HttpGet("{id}/products")]
    public async Task<IActionResult> GetProducts(int id)
    {
        var categoryExists = await _context.Categories
            .AnyAsync(c => c.Id == id);

        if (!categoryExists)
            return NotFound(ApiResponse<object>.ErrorResponse(
                $"Category with id {id} was not found",
                StatusCodes.Status404NotFound
            ));

        var products = await _context.Products
            .Where(p => p.CategoryId == id && p.IsActive)
            .OrderBy(p => p.Name)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Description,
                p.Price,
                p.Stock,
                p.ImageUrl
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.SuccessResponse(
            products,
            "Products retrieved successfully"
        ));
    }
}