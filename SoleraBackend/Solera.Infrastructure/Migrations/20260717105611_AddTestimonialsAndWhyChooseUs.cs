using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Solera.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTestimonialsAndWhyChooseUs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Testimonials",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CustomerRole = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Rating = table.Column<int>(type: "int", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Testimonials", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WhyChooseUs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Icon = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WhyChooseUs", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Testimonials",
                columns: new[] { "Id", "Content", "CreatedAt", "CustomerName", "CustomerRole", "DisplayOrder", "ImageUrl", "IsActive", "Rating" },
                values: new object[,]
                {
                    { 1, "Solera transformed my skin completely! The Hydra Boost Cream is now my holy grail product.", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Ayesha Khan", "Regular Customer", 1, "", true, 5 },
                    { 2, "As someone who reviews skincare products professionally, Solera stands out for their quality and natural ingredients.", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Fatima Ali", "Beauty Blogger", 2, "", true, 5 },
                    { 3, "The Winter Glow Kit was a game-changer for my dry skin. My skin has never felt this hydrated and soft!", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Sara Malik", "Loyal Customer", 3, "", true, 5 }
                });

            migrationBuilder.InsertData(
                table: "WhyChooseUs",
                columns: new[] { "Id", "CreatedAt", "Description", "DisplayOrder", "Icon", "IsActive", "Title" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Every product is crafted with pure, natural ingredients sourced from trusted suppliers around the world.", 1, "🌿", true, "100% Natural Ingredients" },
                    { 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "All our formulations are rigorously tested and approved by certified dermatologists for safety and efficacy.", 2, "🔬", true, "Dermatologist Tested" },
                    { 3, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "We never test on animals. All products are 100% cruelty-free and vegan-friendly.", 3, "🐰", true, "Cruelty Free" },
                    { 4, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Not satisfied? Get a full refund within 30 days. No questions asked.", 4, "💎", true, "Money Back Guarantee" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Testimonials");

            migrationBuilder.DropTable(
                name: "WhyChooseUs");
        }
    }
}
