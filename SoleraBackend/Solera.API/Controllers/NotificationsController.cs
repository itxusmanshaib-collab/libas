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
public class NotificationsController : ControllerBase
{
    private readonly SoleraDbContext _context;

    public NotificationsController(SoleraDbContext context)
    {
        _context = context;
    }

    // ─────────────────────────────────────────
    // GET api/notifications/active
    // Active notification — top bar ke liye
    // Public — Angular app start hone par call karo
    // ─────────────────────────────────────────
    [HttpGet("active")]
    public async Task<IActionResult> GetActiveNotification()
    {
        var now = DateTime.UtcNow;

        // Sirf ek active notification
        var notification = await _context.Notifications
            .Where(n =>
                n.IsActive &&
                n.StartDate <= now &&
                n.EndDate >= now)
            .OrderByDescending(n => n.CreatedAt)
            .FirstOrDefaultAsync();

        if (notification == null)
            return Ok(ApiResponse<Notification>.SuccessResponse(
                null!, "Koi active notification nahi"
            ));

        return Ok(ApiResponse<Notification>.SuccessResponse(
            notification, "Active notification mil gayi"
        ));
    }

    // ─────────────────────────────────────────
    // GET api/notifications — Admin
    // Sab notifications
    // ─────────────────────────────────────────
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var notifications = await _context.Notifications
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

        return Ok(ApiResponse<List<Notification>>.SuccessResponse(
            notifications, "Notifications mil gayi"
        ));
    }

    // ─────────────────────────────────────────
    // POST api/notifications — Admin
    // Nai notification banao
    // ─────────────────────────────────────────
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(
        [FromBody] CreateNotificationDto dto)
    {
        // Pehle sab inactive karo
        // Ek waqt mein sirf ek active hogi
        var existing = await _context.Notifications
            .Where(n => n.IsActive)
            .ToListAsync();

        foreach (var n in existing)
            n.IsActive = false;

        // Nai notification banao
        var notification = new Notification
        {
            Message = dto.Message,
            BackgroundColor = dto.BackgroundColor,
            TextColor = dto.TextColor,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<Notification>.SuccessResponse(
            notification, "Notification ban gayi"
        ));
    }

    // ─────────────────────────────────────────
    // DELETE api/notifications/1 — Admin
    // ─────────────────────────────────────────
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var notification = await _context.Notifications.FindAsync(id);
        if (notification == null)
            return NotFound(ApiResponse<Notification>.ErrorResponse(
                "Notification nahi mili", 404
            ));

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.SuccessResponse(
            null!, "Notification delete ho gayi"
        ));
    }
}