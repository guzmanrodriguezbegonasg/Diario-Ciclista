import React, { useState, useMemo, useEffect } from 'react';
import { TrainingEntry } from '../types';
import EntryItem from './EntryItem';

interface CalendarViewProps {
  entries: TrainingEntry[];
  onDeleteEntry: (id: string) => void;
  onEditEntry: (entry: TrainingEntry) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

// Helper function to get local date in YYYY-MM-DD format, avoiding timezone issues.
const toYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const CalendarView: React.FC<CalendarViewProps> = ({ entries, onDeleteEntry, onEditEntry, selectedDate, setSelectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Sincronizar la vista del calendario si la fecha seleccionada cambia desde fuera
  useEffect(() => {
    if (selectedDate.getMonth() !== currentDate.getMonth() || selectedDate.getFullYear() !== currentDate.getFullYear()) {
      setCurrentDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [selectedDate]);

  const datesWithEntries = useMemo(() => {
    return new Set(entries.map(entry => entry.date));
  }, [entries]);

  const changeMonth = (amount: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + amount);
      return newDate;
    });
  };

  const selectedDayEntries = useMemo(() => {
    const selectedDateString = toYYYYMMDD(selectedDate);
    return entries
      .filter(entry => entry.date === selectedDateString)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, selectedDate]);
  
  const renderCalendarGrid = () => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Ajuste para que la semana empiece en Lunes (getDay() devuelve 0 para Domingo)
    const startingDay = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    const todayString = toYYYYMMDD(new Date());
    const selectedDateString = toYYYYMMDD(selectedDate);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = toYYYYMMDD(date);
      const isToday = todayString === dateString;
      const isSelected = selectedDateString === dateString;

      const baseClasses = "relative w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-amber-400";
      const stateClasses = isSelected
        ? "bg-amber-500 text-slate-900 font-bold"
        : isToday
        ? "border-2 border-amber-400 text-white"
        : "text-slate-200 hover:bg-slate-700";
      
      days.push(
        <div key={day} className="flex justify-center items-center">
          <button onClick={() => setSelectedDate(date)} className={`${baseClasses} ${stateClasses}`}>
            {day}
            {datesWithEntries.has(dateString) && (
              <span className="absolute bottom-1.5 h-1.5 w-1.5 bg-amber-400 rounded-full"></span>
            )}
          </button>
        </div>
      );
    }
    return days;
  };

  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg border border-slate-700 h-full">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => changeMonth(-1)} aria-label="Mes anterior" className="p-2 rounded-full hover:bg-slate-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-lg font-bold text-white capitalize tracking-wide">
          {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={() => changeMonth(1)} aria-label="Mes siguiente" className="p-2 rounded-full hover:bg-slate-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-2 text-center text-sm text-slate-400 mb-2">
        {weekDays.map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-2">
        {renderCalendarGrid()}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-700">
        <h3 className="font-bold text-white mb-3">
          Salidas del {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </h3>
        {selectedDayEntries.length > 0 ? (
          <div className="space-y-3">
            {selectedDayEntries.map(entry => (
              <EntryItem key={entry.id} entry={entry} onDelete={onDeleteEntry} onEdit={onEditEntry} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400">
            <p>No hay salidas registradas para este día.</p>
            <p className="mt-2 text-lg">¡A pedalear! 🚴‍♂️</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;