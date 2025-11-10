import React from 'react';
import { TrainingEntry } from '../types';
import EntryItem from './EntryItem';

interface EntryListProps {
  entries: TrainingEntry[];
  onDeleteEntry: (id: string) => void;
  onEditEntry: (entry: TrainingEntry) => void;
}

const EntryList: React.FC<EntryListProps> = ({ entries, onDeleteEntry, onEditEntry }) => {
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700 h-full">
      <h2 className="text-xl font-bold text-white mb-4">Historial de Salidas</h2>
      {entries.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <p>Aún no has registrado ninguna salida.</p>
          <p className="mt-2 text-lg">¡A pedalear! 🚴‍♂️</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[60vh] lg:max-h-[calc(100vh-25rem)] overflow-y-auto pr-2">
          {sortedEntries.map(entry => (
            <EntryItem 
              key={entry.id} 
              entry={entry} 
              onDelete={onDeleteEntry} 
              onEdit={onEditEntry}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EntryList;