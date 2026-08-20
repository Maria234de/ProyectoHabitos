import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Habit } from '../habit.model';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private apiUrl = 'https://msdficdnqtypleoprtlt.supabase.co/rest/v1';
  private apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zZGZpY2RucXR5cGxlb3BydGx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMzIyMTIsImV4cCI6MjEwMjgwODIxMn0.zBsmim__tyB6wkOT-4OtJgC--oINKEa4sBKz26CU5fs';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'apikey': this.apiKey,
      'Authorization': `Bearer ${this.apiKey}`
    })
  };

  constructor(private http: HttpClient) {}

  // CAMBIO AQUÍ: Pedimos los hábitos Y SUS LOGS al mismo tiempo
  getHabits(): Observable<Habit[]> {
    return this.http.get<Habit[]>(`${this.apiUrl}/habits?select=*,habit_logs(*)`, this.httpOptions);
  }

  createHabit(habit: { name: string }): Observable<Habit> {
    return this.http.post<Habit>(`${this.apiUrl}/habits`, habit, this.httpOptions);
  }

  deleteHabit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/habits?id=eq.${id}`, this.httpOptions);
  }

 toggleDay(habitId: number, dateStr: string, completed: boolean): Observable<any> {
  const payload = {
    habit_id: habitId,
    log_date: dateStr,
    completed: completed
  };

  // Agregamos la cabecera para que Supabase actualice si el registro ya existe
  const upsertOptions = {
    headers: this.httpOptions.headers.set('Prefer', 'resolution=merge-duplicates,return=representation')
  };

  // Agregamos ?on_conflict=habit_id,log_date para evitar duplicados
  return this.http.post(`${this.apiUrl}/habit_logs?on_conflict=habit_id,log_date`, payload, upsertOptions);
}
}