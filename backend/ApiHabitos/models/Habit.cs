using System.ComponentModel.DataAnnotations.Schema;

namespace ApiHabitos.Models;

[Table("habits")]
public class Habit
{
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<HabitLog> Logs { get; set; } = new();
}