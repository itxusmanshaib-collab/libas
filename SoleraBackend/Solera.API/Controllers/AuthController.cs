using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Solera.API.DTOs;
using Solera.API.Helpers;
using Solera.API.Services;
using Solera.Domain.Entities;
using Solera.Infrastructure.Data;
using System.Security.Cryptography;
using System.Text;

namespace Solera.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly SoleraDbContext _context;
    private readonly TokenService _tokenService;

    public AuthController(
        SoleraDbContext context,
        TokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    // ─────────────────────────────────────────
    // POST api/auth/register
    // Naya user register karo
    // ─────────────────────────────────────────
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (existingUser != null)
        {
            return BadRequest(
                ApiResponse<object>.ErrorResponse(
                    "Yeh email pehle se registered hai",
                    400
                )
            );
        }

        var user = new AppUser
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = dto.Password, // Store plain text password
            Role = "User",
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = _tokenService.GenerateToken(user);

        var response = new AuthResponseDto
        {
            Token = token,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };

        return Ok(
            ApiResponse<AuthResponseDto>.SuccessResponse(
                response,
                "User successfully registered"
            )
        );
    }
    // ─────────────────────────────────────────
    // POST api/auth/login
    // User login karo
    // ─────────────────────────────────────────
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null)
        {
            return Unauthorized(
                ApiResponse<object>.ErrorResponse(
                    "Email ya password galat hai",
                    401
                )
            );
        }

        // Compare passwords directly (plain text comparison)
        // The stored PasswordHash contains plain text passwords from seed data
        if (user.PasswordHash != dto.Password)
        {
            return Unauthorized(
                ApiResponse<object>.ErrorResponse(
                    "Email ya password galat hai",
                    401
                )
            );
        }

        var token = _tokenService.GenerateToken(user);

        var response = new AuthResponseDto
        {
            Token = token,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };

        return Ok(
            ApiResponse<AuthResponseDto>.SuccessResponse(
                response,
                "Login successful"
            )
        );
    }
    // ─────────────────────────────────────────
    // Password Hash karne ka function
    // ─────────────────────────────────────────
    private string HashPassword(string password)
    {
        // SHA256 se password hash karo
        using var sha256 = SHA256.Create();

        var bytes = Encoding.UTF8.GetBytes(password);
        var hash = sha256.ComputeHash(bytes);

        // Bytes ko string mein convert karo
        return Convert.ToBase64String(hash);
    }
}