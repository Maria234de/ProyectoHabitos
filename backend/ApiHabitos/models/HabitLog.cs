using System.ComponentModel.DataAnnotations.Schema;

namespace ApiHabitos.Models;

[Table("habit_logs")]
public class HabitLog
{
    [Column("id")]
    public int Id { get; set; }

    [Column("habit_id")]
    public int HabitId { get; set; }

    [Column("log_date")]
    public DateTime LogDate { get; set; }

    [Column("completed")]
    public bool Completed { get; set; }

    public Habit? Habit { get; set; }
}