export interface Log {
  date: string;
  completed: boolean;
}

export interface Habit {
  id?: number;
  name: string;
  createdAt?: string;
  logs?: Log[];
  performancePercentage?: number;
  grade?: string;
}