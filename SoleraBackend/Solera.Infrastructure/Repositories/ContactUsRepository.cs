using Microsoft.EntityFrameworkCore;
using Solera.Domain.Entities;
using Solera.Infrastructure.Data;

namespace Solera.Infrastructure.Repositories
{
    public class ContactUsRepository : GenericRepository<ContactUs>
    {
        public ContactUsRepository(SoleraDbContext context) : base(context) { }
    }
}