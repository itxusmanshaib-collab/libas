using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Solera.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedTestData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 4, "Jeans" },
                    { 5, "T-Shirts" },
                    { 6, "Footwear" },
                    { 7, "Accessories" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "FullName", "Email", "PasswordHash", "Role" },
                values: new object[,]
                {
                    { 1, "Test User", "test@example.com", "hashed_password_123", "Customer" },
                    { 2, "Admin User", "admin@example.com", "admin_hash_456", "Admin" }
                });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Name", "Description", "Price", "Stock", "ImageUrl", "IsActive", "CategoryId" },
                values: new object[,]
                {
                    { 1, "Classic Blue Jeans", "Regular fit blue jeans", 45.99m, 50, "/images/jeans1.jpg", true, 4 },
                    { 2, "Black Skinny Jeans", "Skinny fit black jeans", 52.50m, 30, "/images/jeans2.jpg", true, 4 },
                    { 3, "White T-Shirt", "Pure cotton white t-shirt", 15.99m, 100, "/images/tshirt1.jpg", true, 5 },
                    { 4, "Running Shoes", "Comfortable running shoes", 89.99m, 20, "/images/shoes1.jpg", true, 6 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM Products");
            migrationBuilder.Sql("DELETE FROM Users");
            migrationBuilder.Sql("DELETE FROM Categories");
        }
    }
}
