import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitService } from './services/habit.service';
import { Habit, Log } from './habit.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  habits: Habit[] = [];
  newHabitTitle: string = '';

  constructor(private habitService: HabitService) {}

  ngOnInit(): void {
    this.loadHabits();
  }

  loadHabits(): void {
    this.habitService.getHabits().subscribe({
      next: (data: any[]) => {
        // Mapeamos los hábitos para asegurar que tengan siempre un array de 30 días
        this.habits = data.map(habit => {
          const generatedLogs = this.generate30DaysLogs(habit.habit_logs || []);
          const completedCount = generatedLogs.filter(l => l.completed).length;
          
          return {
            ...habit,
            logs: generatedLogs,
            performancePercentage: Math.round((completedCount / 30) * 100)
          };
        });
      },
      error: (err) => console.error('Error al cargar hábitos:', err)
    });
  }

  // Genera los últimos 30 días y cruza con los guardados en Supabase
  generate30DaysLogs(savedLogs: any[]): Log[] {
    const logs: Log[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      // Busca si el día ya fue marcado en la base de datos de Supabase
      const match = savedLogs.find(l => l.log_date && l.log_date.startsWith(dateStr));

      logs.push({
        date: dateStr,
        completed: match ? match.completed : false
      } as Log);
    }
    return logs;
  }

  addHabit(): void {
    if (!this.newHabitTitle.trim()) return;

    this.habitService.createHabit({ name: this.newHabitTitle }).subscribe({
      next: () => {
        this.newHabitTitle = '';
        this.loadHabits();
      },
      error: (err) => console.error('Error al crear hábito:', err)
    });
  }

  toggleLog(habitId: number | undefined, dayIndex: number): void {
    if (habitId === undefined) return;

    const habit = this.habits.find(h => h.id === habitId);
    if (habit && habit.logs && habit.logs[dayIndex]) {
      const selectedLog = habit.logs[dayIndex];
      
      // 1. Invertir estado en la interfaz
      selectedLog.completed = !selectedLog.completed;

      // 2. Recalcular porcentaje local
      const completedCount = habit.logs.filter((l: Log) => l.completed).length;
      habit.performancePercentage = Math.round((completedCount / 30) * 100);

      // 3. Guardar directamente en Supabase
      this.habitService.toggleDay(habitId, selectedLog.date, selectedLog.completed).subscribe({
        next: () => {},
        error: (err) => {
          console.error('Error al guardar día:', err);
          // Revertir si falla
          selectedLog.completed = !selectedLog.completed;
          const rollbackCount = habit.logs ? habit.logs.filter((l: Log) => l.completed).length : 0;
          habit.performancePercentage = Math.round((rollbackCount / 30) * 100);
        }
      });
    }
  }

  deleteHabit(id: number | undefined): void {
    if (!id) return;
    this.habitService.deleteHabit(id).subscribe({
      next: () => this.loadHabits(),
      error: (err) => console.error('Error al eliminar hábito:', err)
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
  }

  getCompletedCount(habit: Habit): number {
    return habit.logs ? habit.logs.filter((l: Log) => l.completed).length : 0;
  }

  isToday(dateStr: string): boolean {
    if (!dateStr) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateStr.startsWith(today);
  }

  // --- MÉTRICAS DEL DASHBOARD ---

  getGlobalAverage(): number {
    if (this.habits.length === 0) return 0;
    const total = this.habits.reduce((acc, h) => acc + (h.performancePercentage || 0), 0);
    return Math.round(total / this.habits.length);
  }

  getBestHabit(): string {
    if (this.habits.length === 0) return '—';
    const sorted = [...this.habits].sort((a, b) => (b.performancePercentage || 0) - (a.performancePercentage || 0));
    return sorted[0].name;
  }

  getCompletedTodayCount(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.habits.filter(h => {
      if (!h.logs) return false;
      const todayLog = h.logs.find(l => l.date && l.date.startsWith(today));
      return todayLog?.completed;
    }).length;
  }
}