using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Solera.API.DTOs;
using Solera.API.Helpers;
using Solera.Domain.Entities;
using Solera.Infrastructure.Data;

namespace Solera.API.Controllers;

[ApiController]
[Route("api/settings")]
public class SiteSettingsController : ControllerBase
{
    private readonly SoleraDbContext _context;

    public SiteSettingsController(SoleraDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var settings = await _context.SiteSettings
            .OrderBy(s => s.Category)
            .ThenBy(s => s.Key)
            .Select(s => new SiteSettingDto
            {
                Id = s.Id,
                Key = s.Key,
                Value = s.Value,
                Category = s.Category,
                Description = s.Description
            })
            .ToListAsync();

        return Ok(ApiResponse<List<SiteSettingDto>>.SuccessResponse(
            settings, "Settings retrieved successfully"));
    }

    [HttpGet("{key}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByKey(string key)
    {
        var setting = await _context.SiteSettings
            .FirstOrDefaultAsync(s => s.Key == key);

        if (setting == null)
            return NotFound(ApiResponse<object>.ErrorResponse(
                $"Setting '{key}' not found", 404));

        var dto = new SiteSettingDto
        {
            Id = setting.Id,
            Key = setting.Key,
            Value = setting.Value,
            Category = setting.Category,
            Description = setting.Description
        };

        return Ok(ApiResponse<SiteSettingDto>.SuccessResponse(
            dto, "Setting retrieved successfully"));
    }

    [HttpPut("{key}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(string key, [FromBody] UpdateSettingDto dto)
    {
        var setting = await _context.SiteSettings
            .FirstOrDefaultAsync(s => s.Key == key);

        if (setting == null)
            return NotFound(ApiResponse<object>.ErrorResponse(
                $"Setting '{key}' not found", 404));

        setting.Value = dto.Value;
        setting.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var responseDto = new SiteSettingDto
        {
            Id = setting.Id,
            Key = setting.Key,
            Value = setting.Value,
            Category = setting.Category,
            Description = setting.Description
        };

        return Ok(ApiResponse<SiteSettingDto>.SuccessResponse(
            responseDto, "Setting updated successfully"));
    }

    [HttpPut("bulk")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> BulkUpdate([FromBody] BulkUpdateSettingsDto dto)
    {
        var updatedKeys = new List<string>();

        foreach (var item in dto.Settings)
        {
            var setting = await _context.SiteSettings
                .FirstOrDefaultAsync(s => s.Key == item.Key);

            if (setting != null)
            {
                setting.Value = item.Value;
                setting.UpdatedAt = DateTime.UtcNow;
                updatedKeys.Add(item.Key);
            }
            else
            {
                _context.SiteSettings.Add(new SiteSettings
                {
                    Key = item.Key,
                    Value = item.Value,
                    Category = item.Key.StartsWith("home_hero") ? "homepage" : "general",
                    Description = "Created from admin settings",
                    UpdatedAt = DateTime.UtcNow
                });
                updatedKeys.Add(item.Key);
            }
        }

        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.SuccessResponse(
            new { UpdatedKeys = updatedKeys, Count = updatedKeys.Count },
            $"{updatedKeys.Count} settings updated successfully"));
    }
}
