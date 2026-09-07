using Microsoft.IdentityModel.Tokens;
using Solera.Domain.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Solera.API.Services;

// TokenService — JWT token banane ka kaam
public class TokenService
{
    private readonly IConfiguration _config;

    // IConfiguration — appsettings.json se values lene ke liye
    public TokenService(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateToken(AppUser user)
    {
        // Claims — token ke andar jo info store hogi
        // Angular mein jab token decode karte ho toh yahi milta hai
        var claims = new List<Claim>
        {
            // User ki id
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),

            // User ka email
            new Claim(ClaimTypes.Email, user.Email),

            // User ka naam
            new Claim(ClaimTypes.Name, user.FullName),

            // User ka role — "User" ya "Admin"
            // Angular guard mein yahi check hota hai
            new Claim(ClaimTypes.Role, user.Role)
        };

        // Secret key — appsettings.json se
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!)
        );

        // Signing credentials — HMACSHA256 algorithm
        var creds = new SigningCredentials(
            key, SecurityAlgorithms.HmacSha256
        );

        // Token expire time — 7 din
        var expiry = DateTime.UtcNow.AddDays(7);

        // Token banao
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: expiry,
            signingCredentials: creds
        );

        // Token string return karo — eyJhbGci... format mein
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}