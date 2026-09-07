using Microsoft.EntityFrameworkCore;
using Solera.Domain.Interfaces;
using Solera.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Text;

namespace Solera.Infrastructure.Repositories
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {

        protected readonly SoleraDbContext _context;
        protected readonly DbSet<T> _dbSet;
        public GenericRepository(SoleraDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }

        public async Task<T?> GetByIdAsync(int id)
        {
            return await _dbSet.FindAsync(id);
        }

        public async Task AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
        }

        public void Update(T entity)
        {
            _dbSet.Update(entity);
        }


        public void Delete(T entity)
        {
            _dbSet.Remove(entity);
        }


    }

}
