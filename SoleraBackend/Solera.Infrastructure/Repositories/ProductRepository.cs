using Microsoft.EntityFrameworkCore;
using Solera.Domain.Entities;
using Solera.Domain.Interfaces;
using Solera.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Text;

namespace Solera.Infrastructure.Repositories
{
    public class ProductRepository : GenericRepository<Product>, IProductRepository
    {
        public ProductRepository(SoleraDbContext context)
            : base(context)
        {
        }

        public async Task<IEnumerable<Product>> GetByCategoryAsync(int categoryId)
        {
            return await _context.Products
                .Where(p => p.CategoryId == categoryId && p.IsActive)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> SearchAsync(string keyword)
        {

            return await _context.Products
                .Where(p => p.Name.Contains(keyword) ||
                            p.Description.Contains(keyword))
                .Where(p => p.IsActive)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetActiveProductsAsync()
        {
            return await _context.Products
                .Where(p => p.IsActive)
                .Include(p => p.Category)
                .OrderBy(p => p.Name)
                .ToListAsync();
        }
    }
}
