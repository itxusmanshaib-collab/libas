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
public class BannersController : ControllerBase
{
    private readonly SoleraDbContext _context;

    public BannersController(SoleraDbContext context)
    {
        _context = context;
    }

    // ─────────────────────────────────────────
    // GET api/banners
    // Sirf active banners — Home page ke liye
    // Public — login zarori nahi
    // ─────────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> GetActiveBanners()
    {
        var now = DateTime.UtcNow;

        var banners = await _context.Banners
            .Where(b =>
                b.IsActive &&
                b.StartDate <= now &&
                b.EndDate >= now)
            // Display order ke hisaab se sort
            .OrderBy(b => b.DisplayOrder)
            .ToListAsync();

        return Ok(ApiResponse<List<Banner>>.SuccessResponse(
            banners, "Banners mil gaye"
        ));
    }

    // ─────────────────────────────────────────
    // GET api/banners/all — Admin ke liye
    // Sab banners — inactive bhi
    // ─────────────────────────────────────────
    [HttpGet("all")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllBanners()
    {
        var banners = await _context.Banners
            .OrderBy(b => b.DisplayOrder)
            .ToListAsync();

        return Ok(ApiResponse<List<Banner>>.SuccessResponse(
            banners, "Sab banners mil gaye"
        ));
    }

    // ─────────────────────────────────────────
    // POST api/banners — Admin
    // Naya banner banao
    // ─────────────────────────────────────────
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateBannerDto dto)
    {
        var banner = new Banner
        {
            Title = dto.Title,
            SubTitle = dto.SubTitle,
            ImageUrl = dto.ImageUrl,
            LinkUrl = dto.LinkUrl,
            ButtonText = dto.ButtonText,
            DisplayOrder = dto.DisplayOrder,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Banners.Add(banner);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<Banner>.SuccessResponse(
            banner, "Banner ban gaya"
        ));
    }

    // ─────────────────────────────────────────
    // PUT api/banners/1/toggle — Admin
    // Banner active/inactive karo
    // ─────────────────────────────────────────
    [HttpPut("{id}/toggle")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Toggle(int id)
    {
        var banner = await _context.Banners.FindAsync(id);
        if (banner == null)
            return NotFound(ApiResponse<Banner>.ErrorResponse(
                "Banner nahi mila", 404
            ));

        banner.IsActive = !banner.IsActive;
        await _context.SaveChangesAsync();

        var status = banner.IsActive ? "Active" : "Inactive";
        return Ok(ApiResponse<Banner>.SuccessResponse(
            banner, $"Banner {status} ho gaya"
        ));
    }

    // ─────────────────────────────────────────
    // DELETE api/banners/1 — Admin
    // ─────────────────────────────────────────
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var banner = await _context.Banners.FindAsync(id);
        if (banner == null)
            return NotFound(ApiResponse<Banner>.ErrorResponse(
                "Banner nahi mila", 404
            ));

        _context.Banners.Remove(banner);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.SuccessResponse(
            null!, "Banner delete ho gaya"
        ));
    }
}