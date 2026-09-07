using System;
using System.Collections.Generic;
using System.Text;

namespace Solera.Domain.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IProductRepository Products { get; }
        IOrderRepository Orders { get; }
        IWishlistRepository Wishlists { get; }
        Task<int> SaveChangesAsync();
    }
}