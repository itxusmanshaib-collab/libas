using Microsoft.EntityFrameworkCore;
using Solera.Domain.Entities;
using Solera.Domain.Interfaces;
using Solera.Infrastructure.Data;

namespace Solera.Infrastructure.Repositories
{
    public class WishlistRepository : GenericRepository<Wishlist>, IWishlistRepository
    {
        public WishlistRepository(SoleraDbContext context) : base(context) { }

        public async Task<IEnumerable<Wishlist>> GetByUserIdAsync(int userId)
        {
            return await _dbSet
                .Where(w => w.UserId == userId)
                .Include(w => w.Product)
                .ToListAsync();
        }

        public async Task<Wishlist?> GetByUserAndProductAsync(int userId, int productId)
        {
            return await _dbSet
                .FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == productId);
        }
    }
}