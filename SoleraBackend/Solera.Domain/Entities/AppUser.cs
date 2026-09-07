using System;
using System.Collections.Generic;
using System.Text;

namespace Solera.Domain.Entities
{
    public class AppUser
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "User";
        public DateTime CreatedAt { get; set; }

        public List<Order> Orders { get; set; } = new();
    }
}
