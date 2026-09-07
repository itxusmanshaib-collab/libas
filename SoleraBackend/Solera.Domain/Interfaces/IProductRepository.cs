using Solera.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Solera.Domain.Interfaces
{
    public interface IProductRepository : IGenericRepository<Product>
    {

        Task<IEnumerable<Product>> GetByCategoryAsync(int categoryId);
        Task<IEnumerable<Product>> SearchAsync(string keyword);
        Task<IEnumerable<Product>> GetActiveProductsAsync();
    }
}
