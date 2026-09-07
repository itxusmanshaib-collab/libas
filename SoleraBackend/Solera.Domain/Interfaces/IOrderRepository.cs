using Solera.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Solera.Domain.Interfaces
{
    public interface IOrderRepository : IGenericRepository<Order>
    {
        Task<IEnumerable<Order>> GetOrdersByUserIdAsync(int userId);

        Task<Order?> GetOrderWithItemsAsync(int orderId);
    }
}
