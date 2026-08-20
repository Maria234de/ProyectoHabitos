import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Habit } from '../habit.model';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private apiUrl = 'http://localhost:5063/api/habits';

  constructor(private http: HttpClient) {}

  getHabits(): Observable<Habit[]> {
    return this.http.get<Habit[]>(this.apiUrl);
  }

  createHabit(habit: { name: string }): Observable<Habit> {
    return this.http.post<Habit>(this.apiUrl, habit);
  }

  deleteHabit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // CORREGIDO: Ahora envía el formato que espera tu controlador en C# (ToggleLogDto)
  toggleDay(habitId: number, dateStr: string, completed: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/${habitId}/toggle`, {
      date: dateStr,
      completed: completed
    });
  }
}