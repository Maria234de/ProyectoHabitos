using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiHabitos.Data;
using ApiHabitos.Models;

namespace ApiHabitos.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HabitsController : ControllerBase
{
    private readonly AppDbContext _context;

    public HabitsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/habits
    [HttpGet]
    public async Task<ActionResult<IEnumerable<HabitDto>>> GetHabits()
    {
        var today = DateTime.UtcNow.Date;

        // Crear una lista con las fechas de los últimos 30 días
        var last30Days = Enumerable.Range(0, 30)
            .Select(i => today.AddDays(-29 + i).ToString("yyyy-MM-dd"))
            .ToList();

        var habits = await _context.Habits
            .Include(h => h.Logs)
            .ToListAsync();

        var result = habits.Select(h => {
            var logsMap = h.Logs.ToDictionary(
                l => l.LogDate.ToString("yyyy-MM-dd"), 
                l => l.Completed
            );

            var logs = last30Days.Select(dateStr => new HabitLogDto {
                Date = dateStr,
                Completed = logsMap.TryGetValue(dateStr, out bool completed) && completed
            }).ToList();

            int completedCount = logs.Count(l => l.Completed);
            double percentage = Math.Round(((double)completedCount / 30.0) * 100, 1);

            string grade = percentage >= 80 ? "Excelente 🟢" :
                          percentage >= 50 ? "Regular 🟡" : "Necesita mejorar 🔴";

            return new HabitDto {
                Id = h.Id,
                Name = h.Name,
                Logs = logs,
                PerformancePercentage = percentage,
                Grade = grade
            };
        });

        return Ok(result);
    }

    // POST: api/habits
    [HttpPost]
    public async Task<ActionResult<Habit>> CreateHabit([FromBody] CreateHabitDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("El nombre es obligatorio");

        var habit = new Habit { Name = dto.Name };
        _context.Habits.Add(habit);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetHabits), new { id = habit.Id }, habit);
    }

    // PUT: api/habits/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateHabit(int id, [FromBody] CreateHabitDto dto)
    {
        var habit = await _context.Habits.FindAsync(id);
        if (habit == null) return NotFound();

        habit.Name = dto.Name;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/habits/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteHabit(int id)
    {
        var habit = await _context.Habits.FindAsync(id);
        if (habit == null) return NotFound();

        _context.Habits.Remove(habit);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/habits/{id}/toggle
    // Guarda de forma persistente la fecha y su nuevo estado en la DB
    [HttpPost("{id}/toggle")]
    public async Task<IActionResult> ToggleLog(int id, [FromBody] ToggleLogDto dto)
    {
        if (string.IsNullOrEmpty(dto.Date) || !DateTime.TryParse(dto.Date, out DateTime logDate))
            return BadRequest("Fecha inválida");

        var utcDate = DateTime.SpecifyKind(logDate.Date, DateTimeKind.Utc);

        var log = await _context.HabitLogs
            .FirstOrDefaultAsync(l => l.HabitId == id && l.LogDate.Date == utcDate.Date);

        if (log == null) {
            _context.HabitLogs.Add(new HabitLog {
                HabitId = id,
                LogDate = utcDate,
                Completed = dto.Completed
            });
        } else {
            log.Completed = dto.Completed;
            _context.Entry(log).State = EntityState.Modified;
        }

        await _context.SaveChangesAsync();
        return Ok(new { success = true, date = dto.Date, completed = dto.Completed });
    }
}