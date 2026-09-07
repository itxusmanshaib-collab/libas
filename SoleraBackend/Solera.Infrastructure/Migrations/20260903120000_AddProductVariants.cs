using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Solera.Infrastructure.Migrations;

public partial class AddProductVariants : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(name: "GalleryImages", table: "Products", type: "nvarchar(max)", nullable: false, defaultValue: "[]");
        migrationBuilder.AddColumn<string>(name: "AvailableColors", table: "Products", type: "nvarchar(max)", nullable: false, defaultValue: "[]");
        migrationBuilder.AddColumn<string>(name: "AvailableSizes", table: "Products", type: "nvarchar(max)", nullable: false, defaultValue: "[]");
        migrationBuilder.AddColumn<string>(name: "SelectedColor", table: "CartItems", type: "nvarchar(max)", nullable: false, defaultValue: "");
        migrationBuilder.AddColumn<string>(name: "SelectedSize", table: "CartItems", type: "nvarchar(max)", nullable: false, defaultValue: "");
        migrationBuilder.AddColumn<string>(name: "SelectedColor", table: "OrderItem", type: "nvarchar(max)", nullable: false, defaultValue: "");
        migrationBuilder.AddColumn<string>(name: "SelectedSize", table: "OrderItem", type: "nvarchar(max)", nullable: false, defaultValue: "");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "GalleryImages", table: "Products");
        migrationBuilder.DropColumn(name: "AvailableColors", table: "Products");
        migrationBuilder.DropColumn(name: "AvailableSizes", table: "Products");
        migrationBuilder.DropColumn(name: "SelectedColor", table: "CartItems");
        migrationBuilder.DropColumn(name: "SelectedSize", table: "CartItems");
        migrationBuilder.DropColumn(name: "SelectedColor", table: "OrderItem");
        migrationBuilder.DropColumn(name: "SelectedSize", table: "OrderItem");
    }
}
