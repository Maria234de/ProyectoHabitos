namespace ApiHabitos.Models;

public class HabitDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<HabitLogDto> Logs { get; set; } = new();
    public double PerformancePercentage { get; set; }
    public string Grade { get; set; } = string.Empty;
}

public class HabitLogDto
{
    public string Date { get; set; } = string.Empty;
    public bool Completed { get; set; }
}

public class CreateHabitDto
{
    public string Name { get; set; } = string.Empty;
}

public class ToggleLogDto
{
    public string Date { get; set; } = string.Empty;
    public bool Completed { get; set; }
}