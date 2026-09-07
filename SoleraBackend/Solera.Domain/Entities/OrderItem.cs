using System;
using System.Collections.Generic;
using System.Text;

namespace Solera.Domain.Entities
{
    public class OrderItem
    {
        public int Id { get; set; }

        // Kis order ka part hai
        public int OrderId { get; set; }
        public Order Order { get; set; } = null!;

        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public string SelectedColor { get; set; } = string.Empty;
        public string SelectedSize { get; set; } = string.Empty;
    }
}
