using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Solera.API.DTOs;
using Solera.API.Helpers;
using Solera.Domain.Entities;
using Solera.Infrastructure.Data;

namespace Solera.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WhyChooseUsController : ControllerBase
{
    private readonly SoleraDbContext _context;

    public WhyChooseUsController(SoleraDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetActive()
    {
        var items = _context.WhyChooseUs
            .Where(w => w.IsActive)
            .OrderBy(w => w.DisplayOrder)
            .ToList();

        return Ok(ApiResponse<List<WhyChooseUs>>.SuccessResponse(
            items, "WhyChooseUs items retrieved"));
    }

    [HttpGet("all")]
    [Authorize(Roles = "Admin")]
    public IActionResult GetAll()
    {
        var items = _context.WhyChooseUs
            .OrderBy(w => w.DisplayOrder)
            .ToList();

        return Ok(ApiResponse<List<WhyChooseUs>>.SuccessResponse(
            items, "All WhyChooseUs items retrieved"));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public IActionResult Create([FromBody] CreateWhyChooseUsDto dto)
    {
        var item = new WhyChooseUs
        {
            Title = dto.Title,
            Description = dto.Description,
            Icon = dto.Icon,
            DisplayOrder = dto.DisplayOrder,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.WhyChooseUs.Add(item);
        _context.SaveChanges();

        return Ok(ApiResponse<WhyChooseUs>.SuccessResponse(
            item, "WhyChooseUs item created successfully"));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult Update(int id, [FromBody] UpdateWhyChooseUsDto dto)
    {
        var item = _context.WhyChooseUs.Find(id);
        if (item == null)
            return NotFound(ApiResponse<WhyChooseUs>.ErrorResponse(
                "Item not found", 404));

        item.Title = dto.Title;
        item.Description = dto.Description;
        item.Icon = dto.Icon;
        item.DisplayOrder = dto.DisplayOrder;
        item.IsActive = dto.IsActive;

        _context.SaveChanges();

        return Ok(ApiResponse<WhyChooseUs>.SuccessResponse(
            item, "WhyChooseUs item updated successfully"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult Delete(int id)
    {
        var item = _context.WhyChooseUs.Find(id);
        if (item == null)
            return NotFound(ApiResponse<WhyChooseUs>.ErrorResponse(
                "Item not found", 404));

        _context.WhyChooseUs.Remove(item);
        _context.SaveChanges();

        return Ok(ApiResponse<object>.SuccessResponse(
            null!, "WhyChooseUs item deleted successfully"));
    }

    [HttpPut("{id}/toggle")]
    [Authorize(Roles = "Admin")]
    public IActionResult Toggle(int id)
    {
        var item = _context.WhyChooseUs.Find(id);
        if (item == null)
            return NotFound(ApiResponse<WhyChooseUs>.ErrorResponse(
                "Item not found", 404));

        item.IsActive = !item.IsActive;
        _context.SaveChanges();

        return Ok(ApiResponse<WhyChooseUs>.SuccessResponse(
            item, $"Item {(item.IsActive ? "activated" : "deactivated")}"));
    }
}
