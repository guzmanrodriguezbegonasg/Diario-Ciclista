
export interface TrainingEntry {
  id: string;
  date: string; // Stored as 'YYYY-MM-DD'
  distance: number;
  duration: string; // Stored as 'HH:MM'
  notes: string;
}