import React, { useState, useEffect } from 'react';
import { TrainingEntry } from '../types';

interface EntryFormProps {
  onSaveEntry: (entry: Omit<TrainingEntry, 'id'>, id?: string) => void;
  editingEntry: TrainingEntry | null;
  onCancelEdit: () => void;
}

const EntryForm: React.FC<EntryFormProps> = ({ onSaveEntry, editingEntry, onCancelEdit }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const isEditing = !!editingEntry;

  useEffect(() => {
    if (editingEntry) {
      setDate(editingEntry.date);
      setDistance(String(editingEntry.distance));
      setDuration(editingEntry.duration || '');
      setNotes(editingEntry.notes);
      setError('');
    } else {
      // Reset form to default values when editing is cancelled or completed.
      // This doesn't run after adding a new entry, which is why we handle it in handleSubmit.
      setDate(new Date().toISOString().split('T')[0]);
      setDistance('');
      setDuration('');
      setNotes('');
      setError('');
    }
  }, [editingEntry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const distanceNum = parseFloat(distance);
    if (!date || !distance || isNaN(distanceNum) || distanceNum <= 0) {
      setError('Por favor, introduce una fecha y una distancia válida (mayor que 0).');
      return;
    }
    setError('');
    onSaveEntry(
      { date, distance: distanceNum, duration, notes },
      editingEntry ? editingEntry.id : undefined
    );

    // If a new entry was just added, clear the form for the next one.
    if (!isEditing) {
      setDistance('');
      setDuration('');
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700 h-full">
      <h2 className="text-xl font-bold text-white mb-4">
        {isEditing ? 'Editar Salida' : 'Añadir Nueva Salida'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-300 mb-1">Fecha</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
          />
        </div>
        <div>
          <label htmlFor="distance" className="block text-sm font-medium text-slate-300 mb-1">Distancia (km)</label>
          <input
            type="number"
            id="distance"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="Ej: 50.5"
            step="0.1"
            min="0"
            className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
          />
        </div>
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-slate-300 mb-1">Duración</label>
          <input
            type="text"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Ej: 2h 30m"
            className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
          />
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-300 mb-1">Notas del Entrenamiento</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="¿Qué tal ha ido la ruta? ¿Sensaciones?"
            className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex flex-col sm:flex-row gap-2">
            {isEditing && (
                <button
                type="button"
                onClick={onCancelEdit}
                className="w-full bg-slate-600 hover:bg-slate-700 text-slate-200 font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out"
                >
                Cancelar
                </button>
            )}
            <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-amber-400"
            >
            {isEditing ? 'Actualizar Entrenamiento' : 'Guardar Entrenamiento'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default EntryForm;