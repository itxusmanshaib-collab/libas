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
public class TestimonialsController : ControllerBase
{
    private readonly SoleraDbContext _context;

    public TestimonialsController(SoleraDbContext context)
    {
        _context = context;
    }

    // ─────────────────────────────────────────
    // GET api/testimonials
    // Active testimonials — Home page ke liye
    // Public
    // ─────────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> GetActiveTestimonials()
    {
        var testimonials = await _context.Testimonials
            .Where(t => t.IsActive)
            .OrderBy(t => t.DisplayOrder)
            .ToListAsync();

        return Ok(ApiResponse<List<Testimonial>>.SuccessResponse(
            testimonials, "Testimonials mil gaye"
        ));
    }

    // ─────────────────────────────────────────
    // GET api/testimonials/all — Admin ke liye
    // Sab testimonials — inactive bhi
    // ─────────────────────────────────────────
    [HttpGet("all")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllTestimonials()
    {
        var testimonials = await _context.Testimonials
            .OrderBy(t => t.DisplayOrder)
            .ToListAsync();

        return Ok(ApiResponse<List<Testimonial>>.SuccessResponse(
            testimonials, "Sab testimonials mil gaye"
        ));
    }

    // ─────────────────────────────────────────
    // POST api/testimonials — Admin
    // Naya testimonial banao
    // ─────────────────────────────────────────
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateTestimonialDto dto)
    {
        var testimonial = new Testimonial
        {
            CustomerName = dto.CustomerName,
            CustomerRole = dto.CustomerRole,
            Content = dto.Content,
            Rating = dto.Rating,
            ImageUrl = dto.ImageUrl,
            DisplayOrder = dto.DisplayOrder,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Testimonials.Add(testimonial);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<Testimonial>.SuccessResponse(
            testimonial, "Testimonial ban gaya"
        ));
    }

    // ─────────────────────────────────────────
    // PUT api/testimonials/1 — Admin
    // Testimonial update karo
    // ─────────────────────────────────────────
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTestimonialDto dto)
    {
        var testimonial = await _context.Testimonials.FindAsync(id);
        if (testimonial == null)
            return NotFound(ApiResponse<Testimonial>.ErrorResponse(
                "Testimonial nahi mila", 404
            ));

        testimonial.CustomerName = dto.CustomerName;
        testimonial.CustomerRole = dto.CustomerRole;
        testimonial.Content = dto.Content;
        testimonial.Rating = dto.Rating;
        testimonial.ImageUrl = dto.ImageUrl;
        testimonial.IsActive = dto.IsActive;
        testimonial.DisplayOrder = dto.DisplayOrder;

        await _context.SaveChangesAsync();

        return Ok(ApiResponse<Testimonial>.SuccessResponse(
            testimonial, "Testimonial update ho gaya"
        ));
    }

    // ─────────────────────────────────────────
    // DELETE api/testimonials/1 — Admin
    // ─────────────────────────────────────────
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var testimonial = await _context.Testimonials.FindAsync(id);
        if (testimonial == null)
            return NotFound(ApiResponse<Testimonial>.ErrorResponse(
                "Testimonial nahi mila", 404
            ));

        _context.Testimonials.Remove(testimonial);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.SuccessResponse(
            null!, "Testimonial delete ho gaya"
        ));
    }

    // ─────────────────────────────────────────
    // PUT api/testimonials/1/toggle — Admin
    // Testimonial active/inactive karo
    // ─────────────────────────────────────────
    [HttpPut("{id}/toggle")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Toggle(int id)
    {
        var testimonial = await _context.Testimonials.FindAsync(id);
        if (testimonial == null)
            return NotFound(ApiResponse<Testimonial>.ErrorResponse(
                "Testimonial nahi mila", 404
            ));

        testimonial.IsActive = !testimonial.IsActive;
        await _context.SaveChangesAsync();

        var status = testimonial.IsActive ? "Active" : "Inactive";
        return Ok(ApiResponse<Testimonial>.SuccessResponse(
            testimonial, $"Testimonial {status} ho gaya"
        ));
    }
}
