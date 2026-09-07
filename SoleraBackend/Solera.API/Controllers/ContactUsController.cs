using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Solera.API.Helpers;
using Solera.API.DTOs;
using Solera.Domain.Entities;
using Solera.Infrastructure.Data;

namespace Solera.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactUsController : ControllerBase
{
    private readonly SoleraDbContext _context;

    public ContactUsController(SoleraDbContext context)
    {
        _context = context;
    }

    // ─────────────────────────────────────────
    // POST api/contactus — Submit contact form
    // Message ko database mein save karta hai (email bina)
    // ─────────────────────────────────────────
    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Create([FromBody] ContactUsDto dto)
    {
        var message = new ContactUs
        {
            FullName = dto.FullName,
            Email = dto.Email,
            Subject = dto.Subject,
            Message = dto.Message,
            Status = "New",
            CreatedAt = DateTime.UtcNow
        };

        _context.ContactUs.Add(message);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<ContactUs>.SuccessResponse(
            message, "Message saved successfully"
        ));
    }

    // ─────────────────────────────────────────
    // GET api/contactus — Admin
    // All contact messages — read karne ke liye status update karega
    // ─────────────────────────────────────────
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var messages = await _context.ContactUs
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new
            {
                m.Id,
                m.FullName,
                m.Email,
                m.Subject,
                m.Message,
                m.Status,
                m.CreatedAt
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.SuccessResponse(
            messages, $"{messages.Count} contact messages"
        ));
    }

    // ─────────────────────────────────────────
    // PUT api/contactus/1/read — Admin
    // Message mark karo read
    // ─────────────────────────────────────────
    [HttpPut("{id}/read")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var message = await _context.ContactUs.FindAsync(id);
        if (message == null)
            return NotFound(ApiResponse<ContactUs>.ErrorResponse(
                "Message nahi mila", 404
            ));

        message.Status = "Read";
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.SuccessResponse(
            null!, "Message mark ho gaya read"
        ));
    }

    // ─────────────────────────────────────────
    // PUT api/contactus/1/reply — Admin
    // Reply dene ke liye (bas status update — actual reply logic frontend pe)
    // ─────────────────────────────────────────
    [HttpPut("{id}/reply")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddReply(int id, [FromBody] string replyMessage)
    {
        var message = await _context.ContactUs.FindAsync(id);
        if (message == null)
            return NotFound(ApiResponse<ContactUs>.ErrorResponse(
                "Message nahi mila", 404
            ));

        // Reply store karne ke liye hum message ka existing pattern use kar rahe hain
        // Ya app ko aap apna reply system de sakte hain
        message.Status = "Replied";
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.SuccessResponse(
            null!, "Reply record ho gaya"
        ));
    }
}