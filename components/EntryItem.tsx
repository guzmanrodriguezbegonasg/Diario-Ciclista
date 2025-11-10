import React from 'react';
import { TrainingEntry } from '../types';

interface EntryItemProps {
  entry: TrainingEntry;
  onDelete: (id: string) => void;
  onEdit: (entry: TrainingEntry) => void;
}

const EntryItem: React.FC<EntryItemProps> = ({ entry, onDelete, onEdit }) => {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-700 hover:border-amber-500/50 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-white">{formatDate(entry.date)}</p>
          <p className="text-amber-400 text-lg font-semibold">{entry.distance} km</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onEdit(entry)}
            className="text-slate-500 hover:text-amber-400 transition-colors"
            aria-label="Editar entrada"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
              <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="transition-colors text-slate-500 hover:text-red-400"
            aria-label="Eliminar entrada"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      {entry.notes && (
        <p className="text-slate-300 mt-2 text-sm whitespace-pre-wrap">{entry.notes}</p>
      )}
    </div>
  );
};

export default EntryItem;