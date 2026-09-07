using Solera.Domain.Interfaces;
using Solera.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Text;

namespace Solera.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly SoleraDbContext _context;
        private IProductRepository? _products;
        private IOrderRepository? _orders;

        public UnitOfWork(SoleraDbContext context)
        {
            _context = context;
        }

        public IProductRepository Products
            => _products ??= new ProductRepository(_context);

        public IOrderRepository Orders
            => _orders ??= new OrderRepository(_context);

        public IWishlistRepository Wishlists => new WishlistRepository(_context);

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
