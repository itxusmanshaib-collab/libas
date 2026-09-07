using Solera.Domain.Entities;

namespace Solera.Domain.Interfaces;

public interface IWishlistRepository : IGenericRepository<Wishlist>
{
    Task<IEnumerable<Wishlist>> GetByUserIdAsync(int userId);
    Task<Wishlist?> GetByUserAndProductAsync(int userId, int productId);
}