namespace Solera.API.DTOs;

// Profile response — user ko apni info dikhao
public class ProfileResponseDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    // Kitne orders kiye hain
    public int TotalOrders { get; set; }

    // Total kitna kharch kiya
    public decimal TotalSpent { get; set; }
}

// Profile update karne ke liye
public class UpdateProfileDto
{
    // Sirf naam update ho sakta hai
    // Email change nahi hoga — security reason
    public string FullName { get; set; } = string.Empty;
}

// Password change karne ke liye
public class ChangePasswordDto
{
    // Pehle purana password confirm karo
    public string CurrentPassword { get; set; } = string.Empty;

    // Naya password
    public string NewPassword { get; set; } = string.Empty;

    // Confirm karo — dono match hone chahiye
    public string ConfirmNewPassword { get; set; } = string.Empty;
}