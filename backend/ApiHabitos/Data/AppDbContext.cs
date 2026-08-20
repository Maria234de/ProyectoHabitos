using Microsoft.EntityFrameworkCore;
using ApiHabitos.Models;

namespace ApiHabitos.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Habit> Habits => Set<Habit>();
    public DbSet<HabitLog> HabitLogs => Set<HabitLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<HabitLog>()
            .HasIndex(l => new { l.HabitId, l.LogDate })
            .IsUnique();
    }
}